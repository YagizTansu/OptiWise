import { useState, useEffect } from 'react';
import { FaFilter, FaArrowDown, FaArrowUp, FaExclamationTriangle } from 'react-icons/fa';
import styles from '../styles/QuantumScreener.module.css';
import { fetchSeasonalityData, fetchSeasonalStrategyInsights, SeasonalStrategyResponse } from '../services/api/finance';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Types for our data
interface ScreenerItem {
  id: number;
  instrument: string;
  ticker: string;
  correlation: number;
  winRate: number;
  avgReturn: number;
  volatility: number;
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
  { symbol: 'MS', name: 'Morgan Stanley' },
  { symbol: 'NFLX', name: 'Netflix Inc' },
  { symbol: 'DIS', name: 'Walt Disney Co' },
  { symbol: 'VZ', name: 'Verizon Communications Inc' },
  { symbol: 'T', name: 'AT&T Inc' },
  { symbol: 'PFE', name: 'Pfizer Inc' },
  { symbol: 'KO', name: 'Coca-Cola Co' },
  { symbol: 'PEP', name: 'PepsiCo Inc' },
  { symbol: 'MRK', name: 'Merck & Co Inc' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc' },
  { symbol: 'INTC', name: 'Intel Corp' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc' },
  { symbol: 'NFLX', name: 'Netflix Inc' },
  { symbol: 'XOM', name: 'Exxon Mobil Corp' },
  { symbol: 'CVX', name: 'Chevron Corp' },
  { symbol: 'BA', name: 'Boeing Co' },
  { symbol: 'IBM', name: 'International Business Machines Corp' },
  { symbol: 'WFC', name: 'Wells Fargo & Co' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc' },
  { symbol: 'HD', name: 'Home Depot Inc' },
  { symbol: 'VZ', name: 'Verizon Communications Inc' },
  { symbol: 'CMCSA', name: 'Comcast Corp' },
  { symbol: 'TGT', name: 'Target Corp' },
  { symbol: 'NKE', name: 'Nike Inc' },
  { symbol: 'ADBE', name: 'Adobe Inc' },
  { symbol: 'CRM', name: 'Salesforce.com Inc' },
  { symbol: 'ORCL', name: 'Oracle Corp' },
  { symbol: 'INTU', name: 'Intuit Inc' },
  { symbol: 'QCOM', name: 'Qualcomm Inc' },
  { symbol: 'TXN', name: 'Texas Instruments Inc' },
  { symbol: 'AVGO', name: 'Broadcom Inc' },
  { symbol: 'NOW', name: 'ServiceNow Inc' },
  { symbol: 'HON', name: 'Honeywell International Inc' },
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
  { symbol: 'EUR=X', name: 'EUR/USD' },
];

// Periods to check for seasonality correlation
const SEASONALITY_PERIODS = [1, 3, 5, 7, 10, 15, 20];

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
                const targetMonth = new Date();
                const endDate = new Date();

                if (direction === 'long') {
                  // For long positions, analyze from current month forward
                  targetMonth.setMonth(targetMonth.getMonth());
                  endDate.setMonth(targetMonth.getMonth() + months);
                } else {
                  // For short positions, still analyze forward but expect opposite movement
                  targetMonth.setMonth(targetMonth.getMonth());
                  endDate.setMonth(targetMonth.getMonth() + months);
                }
                
                // Format dates
                const startDateStr = formatDate(targetMonth);
                const endDateStr = formatDate(endDate);
                
                // Extract monthly stats from the data
                const monthDetails = getRelevantMonthsData(strategyData, targetMonth, months, direction);
                
                // Calculate win rate (percentage of profitable periods)
                const winRate = calculateAverage(monthDetails.map(m => m.consistency));
                
                // Calculate average return for all periods
                const monthlyReturns = monthDetails.map(m => 
                  direction === 'long' ? m.avgReturn : -m.avgReturn
                );
                const avgReturn = calculateAverageReturn(monthlyReturns);
                const volatility = calculateVolatility(monthlyReturns);
                
                // Calculate overall score
                const score = (
                  (correlation * 0.25) + 
                  ((winRate / 100) * 0.30) + 
                  (avgReturn > 0 ? (Math.min(Math.abs(avgReturn), 10) / 10 * 0.30) : 0) +
                  (volatility > 0 ? (1 / Math.min(volatility, 10) * 0.15) : 0)  // Lower volatility = higher score
                );
                
                screenerResults.push({
                  id: index + 1,
                  instrument: symbolData.name,
                  ticker: symbolData.symbol,
                  correlation,
                  winRate,
                  avgReturn,
                  volatility,
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
      
      // Find the strongest correlation with current price pattern
      // This checks multiple seasonality periods against current price action
      let bestCorrelation = 0;
      let bestPeriod = 0;
      
      // Extract recent price pattern
      const recentPattern = data.slice(-30); // Last 30 data points
      
      // Test different seasonality periods
      for (const period of SEASONALITY_PERIODS) {
        if (data.length < period * 2) continue; // Skip if not enough data
        
        // Extract historical pattern for this period
        const historicalPattern = data.slice(-period * 2, -period);
        
        // Calculate correlation coefficient between recent pattern and this historical period
        const corrCoef = calculateCorrelationCoefficient(historicalPattern, recentPattern);
        
        // Store if it's the strongest correlation
        if (Math.abs(corrCoef) > Math.abs(bestCorrelation)) {
          bestCorrelation = corrCoef;
          bestPeriod = period;
        }
      }
      
      // Return the absolute correlation (strength matters more than direction)
      return Math.abs(bestCorrelation);
    } catch (err) {
      console.error('Error calculating correlation:', err);
      return 0.5; // Default fallback
    }
  }
  
  // Calculate correlation coefficient between two data series
  function calculateCorrelationCoefficient(series1: number[], series2: number[]): number {
    // Use smaller length
    const n = Math.min(series1.length, series2.length);
    
    if (n < 5) return 0; // Not enough data points
    
    // Trim to same length
    const x = series1.slice(0, n);
    const y = series2.slice(0, n);
    
    // Calculate means
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate covariance and standard deviations
    let covariance = 0;
    let stdX = 0;
    let stdY = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX;
      const yDiff = y[i] - meanY;
      covariance += xDiff * yDiff;
      stdX += xDiff * xDiff;
      stdY += yDiff * yDiff;
    }
    
    // Prevent division by zero
    if (stdX === 0 || stdY === 0) return 0;
    
    // Return correlation coefficient
    return covariance / Math.sqrt(stdX * stdY);
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

  // Calculate average return for all periods
  function calculateAverageReturn(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
  }

  // Calculate volatility
  function calculateVolatility(numbers: number[]): number {
    if (numbers.length < 2) return 0;
    const mean = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
    const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
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
                            onClick={() => handleSort('volatility')} 
                            className={`${styles.sortableHeader} ${styles.dataColumn}`}
                          >
                            <div className={styles.headerContent}>
                              <span>Volatility %</span>
                              {sortBy === 'volatility' && (
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
                            <td className={styles.dataColumn}>{item.volatility?.toFixed(2) || "N/A"}%</td>
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
