import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaFilter, FaArrowDown, FaArrowUp, FaCalendarAlt, FaChartLine, FaPercentage, FaTrophy, FaExclamationTriangle } from 'react-icons/fa';
import styles from '../styles/QuantumScreener.module.css';
import { fetchSeasonalityData, fetchSeasonalStrategyInsights, SeasonalStrategyResponse } from '../services/api/finance';
import Layout from '../components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Types for our data
interface ScreenerItem {
  id: number;
  instrument: string;
  ticker: string;
  correlation: number;
  winRate: number;
  avgReturn: number;
  openDate: string;
  closeDate: string;
  score: number;
}

// List of popular symbols to analyze
const SYMBOLS_TO_ANALYZE = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp' },
  { symbol: 'AMZN', name: 'Amazon.com Inc' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc' },
  { symbol: 'NVDA', name: 'NVIDIA Corp' },
  { symbol: 'META', name: 'Meta Platforms Inc' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co' },
  { symbol: 'V', name: 'Visa Inc' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'WMT', name: 'Walmart Inc' },
  { symbol: 'PG', name: 'Procter & Gamble Co' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq-100 ETF' },
  { symbol: 'IWM', name: 'Russell 2000 ETF' },
  { symbol: 'EEM', name: 'Emerging Markets ETF' },
  { symbol: 'GLD', name: 'Gold ETF' },
  { symbol: 'BTC-USD', name: 'Bitcoin USD' },
  { symbol: 'ETH-USD', name: 'Ethereum USD' },
  { symbol: 'EUR=X', name: 'EUR/USD' }
];

// Map duration to months for API calls
const durationToMonths: Record<string, number> = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
  '12M': 12
};

export default function QuantumScreener() {
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [duration, setDuration] = useState<'1M' | '3M' | '6M' | '12M'>('3M');
  const [sortBy, setSortBy] = useState<keyof ScreenerItem>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [results, setResults] = useState<ScreenerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from the API
  useEffect(() => {
    async function fetchScreenerData() {
      setLoading(true);
      setError(null);
      
      try {
        const months = durationToMonths[duration];
        const screenerResults: ScreenerItem[] = [];
        
        // Process multiple symbols in parallel with Promise.all
        const promiseResults = await Promise.all(
          SYMBOLS_TO_ANALYZE.map(async (symbolData, index) => {
            try {
              // Fetch seasonality statistics for this symbol
              const strategyData = await fetchSeasonalStrategyInsights(symbolData.symbol, 5);
              
              // Fetch monthly seasonality data
              const seasonalityData = await fetchSeasonalityData(
                symbolData.symbol, 
                'monthly', 
                [{ label: '5 Years', years: 5 }]
              );
              
              // Calculate correlation from seasonality data
              const correlation = calculateCorrelation(seasonalityData);
              
              if (strategyData && !strategyData.error) {
                // Find relevant month based on duration
                const currentDate = new Date();
                const targetMonth = new Date(
                  direction === 'long' 
                    ? currentDate.setMonth(currentDate.getMonth()) 
                    : currentDate.setMonth(currentDate.getMonth() - months)
                );
                
                const endDate = new Date(
                  direction === 'long' 
                    ? currentDate.setMonth(currentDate.getMonth() + months) 
                    : currentDate.setMonth(currentDate.getMonth())
                );
                
                // Format dates
                const startDateStr = formatDate(targetMonth);
                const endDateStr = formatDate(endDate);
                
                // Extract monthly stats from the data
                const monthDetails = getRelevantMonthsData(strategyData, targetMonth, months, direction);
                
                // Calculate average win rate and return
                const winRate = calculateAverage(monthDetails.map(m => m.consistency));
                const avgReturn = direction === 'long' 
                  ? calculateAverage(monthDetails.map(m => m.avgReturn))
                  : calculateAverage(monthDetails.map(m => -m.avgReturn)); // Inverse for short positions
                
                // Calculate overall score
                const score = (
                  (correlation * 0.3) + 
                  ((winRate / 100) * 0.4) + 
                  (Math.min(Math.abs(avgReturn), 10) / 10 * 0.3)
                );
                
                screenerResults.push({
                  id: index + 1,
                  instrument: symbolData.name,
                  ticker: symbolData.symbol,
                  correlation,
                  winRate,
                  avgReturn,
                  openDate: startDateStr,
                  closeDate: endDateStr,
                  score
                });
              }
            } catch (err) {
              console.error(`Error processing ${symbolData.symbol}:`, err);
              // Continue with other symbols instead of failing the whole process
            }
          })
        );
        
        setResults(screenerResults);
      } catch (err) {
        console.error('Error fetching screener data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchScreenerData();
  }, [direction, duration]);

  // Calculate correlation coefficient for seasonality data
  function calculateCorrelation(seasonalityData: any): number {
    try {
      if (!seasonalityData || !seasonalityData.labels || !seasonalityData.datasets) {
        return 0.5; // Default fallback
      }
      
      const data = seasonalityData.datasets[0]?.data;
      if (!data || data.length < 2) return 0.5;
      
      // Simple correlation calculation: percentage of positive months
      const positiveMonths = data.filter((val: number) => val > 0).length;
      return (positiveMonths / data.length) * 0.8 + 0.1; // Scale to 0.1-0.9 range
    } catch (err) {
      console.error('Error calculating correlation:', err);
      return 0.5; // Default fallback
    }
  }
  
  // Format date to readable string
  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Get relevant months' data from strategy insights
  function getRelevantMonthsData(
    strategyData: SeasonalStrategyResponse, 
    startMonth: Date, 
    durationMonths: number,
    direction: 'long' | 'short'
  ) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const startMonthIndex = startMonth.getMonth();
    const relevantMonths = [];
    
    for (let i = 0; i < durationMonths; i++) {
      const monthIndex = (startMonthIndex + i) % 12;
      const monthName = monthNames[monthIndex];
      const monthData = strategyData.monthlyDetailedData[monthName];
      
      if (monthData) {
        relevantMonths.push(monthData);
      } else {
        // Add default data if month not found
        relevantMonths.push({
          avgReturn: 0,
          consistency: 50,
          years: 0,
          positiveYears: 0,
          maxReturn: 0,
          minReturn: 0,
          volatility: 0
        });
      }
    }
    
    return relevantMonths;
  }
  
  // Calculate average of numbers
  function calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
  }

  // Sort the results
  const sortedResults = [...results].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle sort click
  const handleSort = (column: keyof ScreenerItem) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  return (
    <Layout title="Quantum Screener | OptiWise">
      <ProtectedRoute>
        <div className={styles.container}>
          <main className={styles.main}>
            <div className={styles.filterSection}>
              <div className={styles.filterCard}>
                <div className={styles.filterHeader}>
                  <h2><FaFilter className={styles.filterIcon} /> Filter Options</h2>
                </div>
                <div className={styles.filterControls}>
                  <div className={styles.filterGroup}>
                    <label>Direction</label>
                    <div className={styles.buttonGroup}>
                      <button 
                        className={`${styles.filterButton} ${direction === 'long' ? styles.active : ''}`} 
                        onClick={() => setDirection('long')}
                      >
                        Long
                      </button>
                      <button 
                        className={`${styles.filterButton} ${direction === 'short' ? styles.active : ''}`} 
                        onClick={() => setDirection('short')}
                      >
                        Short
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.filterGroup}>
                    <label>Duration</label>
                    <div className={styles.buttonGroup}>
                      <button 
                        className={`${styles.filterButton} ${duration === '1M' ? styles.active : ''}`} 
                        onClick={() => setDuration('1M')}
                      >
                        1M
                      </button>
                      <button 
                        className={`${styles.filterButton} ${duration === '3M' ? styles.active : ''}`} 
                        onClick={() => setDuration('3M')}
                      >
                        3M
                      </button>
                      <button 
                        className={`${styles.filterButton} ${duration === '6M' ? styles.active : ''}`} 
                        onClick={() => setDuration('6M')}
                      >
                        6M
                      </button>
                      <button 
                        className={`${styles.filterButton} ${duration === '12M' ? styles.active : ''}`} 
                        onClick={() => setDuration('12M')}
                      >
                        12M
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.resultsSection}>
              <div className={styles.resultsCard}>
                <div className={styles.tableHeader}>
                  <h2>Screening Results</h2>
                  <div className={styles.legend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ background: 'linear-gradient(135deg, #4361ee, #7209b7)' }}></div>
                      <span>Top Opportunities</span>
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Analyzing market data...</p>
                  </div>
                ) : error ? (
                  <div className={styles.errorMessage}>
                    <FaExclamationTriangle />
                    <p>{error}</p>
                  </div>
                ) : sortedResults.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No results found. Try adjusting your filters.</p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.resultsTable}>
                      <thead>
                        <tr>
                          <th className={styles.instrumentColumn}>Instrument</th>
                          <th 
                            onClick={() => handleSort('correlation')} 
                            className={`${styles.sortableHeader} ${styles.dataColumn}`}
                          >
                            <div className={styles.headerContent}>
                              <span>Correlation</span>
                              {sortBy === 'correlation' && (
                                <span className={styles.sortIcon}>
                                  {sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                                </span>
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('winRate')} 
                            className={`${styles.sortableHeader} ${styles.dataColumn}`}
                          >
                            <div className={styles.headerContent}>
                              <span>Win Rate %</span>
                              {sortBy === 'winRate' && (
                                <span className={styles.sortIcon}>
                                  {sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                                </span>
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('avgReturn')} 
                            className={`${styles.sortableHeader} ${styles.returnColumn}`}
                          >
                            <div className={styles.headerContent}>
                              <span>Avg Return %</span>
                              {sortBy === 'avgReturn' && (
                                <span className={styles.sortIcon}>
                                  {sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                                </span>
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('openDate')} 
                            className={`${styles.sortableHeader} ${styles.dateColumn}`}
                          >
                            <div className={styles.headerContent}>
                              <span>Open Date</span>
                              {sortBy === 'openDate' && (
                                <span className={styles.sortIcon}>
                                  {sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                                </span>
                              )}
                            </div>
                          </th>
                          <th 
                            onClick={() => handleSort('closeDate')} 
                            className={`${styles.sortableHeader} ${styles.dateColumn}`}
                          >
                            <div className={styles.headerContent}>
                              <span>Close Date</span>
                              {sortBy === 'closeDate' && (
                                <span className={styles.sortIcon}>
                                  {sortDirection === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
                                </span>
                              )}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedResults.map((item) => (
                          <tr key={item.id} className={item.score > 0.7 ? styles.highlightedRow : ''}>
                            <td className={styles.instrumentColumn}>
                              <div className={styles.instrumentCell}>
                                <span className={styles.instrumentName}>{item.instrument}</span>
                                <span className={styles.ticker}>{item.ticker}</span>
                              </div>
                            </td>
                            <td className={styles.dataColumn}>
                              <div className={styles.correlationCell}>
                                <div className={styles.progressBar}>
                                  <div 
                                    className={styles.progressFill} 
                                    style={{ width: `${item.correlation * 100}%` }}
                                  ></div>
                                </div>
                                <span className={styles.numericValue}>{item.correlation.toFixed(2)}</span>
                              </div>
                            </td>
                            <td className={styles.dataColumn}>
                              <div className={styles.winRateCell}>
                                <div className={styles.progressBar}>
                                  <div 
                                    className={styles.progressFill} 
                                    style={{ width: `${item.winRate}%` }}
                                  ></div>
                                </div>
                                <span className={styles.numericValue}>{item.winRate.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className={`${styles.returnCell} ${styles.returnColumn} ${item.avgReturn >= 0 ? styles.positive : styles.negative}`}>
                              {item.avgReturn >= 0 ? '+' : ''}{item.avgReturn.toFixed(1)}%
                            </td>
                            <td className={styles.dateColumn}>{item.openDate}</td>
                            <td className={styles.dateColumn}>{item.closeDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
