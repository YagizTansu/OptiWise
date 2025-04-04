import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { 
  FaBalanceScale, FaInfoCircle, FaChartLine, FaArrowUp, FaCalendarAlt, 
  FaFilter, FaSearch, FaSpinner, FaSort, FaSortUp, FaSortDown, 
  FaGlobeAmericas, FaChartPie, FaLightbulb, FaExclamationTriangle 
} from 'react-icons/fa';
import styles from '../styles/breakeven.module.css';
import Layout from '../components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  fetchFundamentalsTimeSeries, 
  searchSymbols, 
  fetchQuoteData, 
  fetchChartData 
} from '../services/api/finance';
import { Chart } from 'chart.js/auto';
import { Pie, Line } from 'react-chartjs-2';

// Define interface for breakeven stock data
interface BreakenStock {
  id: number;
  symbol: string;
  name: string;
  country: string;
  sector: string;
  industry: string;
  marketCap: string;
  marketCapValue: number; // For sorting
  lastQuarterProfit: string;
  profitValue: number; // For sorting
  breakEvenQuarter: string;
  previousLosses: string;
  growthSince: string;
  growthValue: number; // For sorting
  nextEarnings: string;
}

// Define interface for chart data
interface StockPerformance {
  symbol: string;
  name: string;
  labels: string[];
  prices: number[];
  breakEvenIndex: number;
}

// Success stories data
const successStories = [
  {
    symbol: 'TSLA',
    name: 'Tesla',
    description: 'Tesla achieved consistent profitability in Q3 2019 after years of losses, leading to a remarkable 1,500% stock price increase over the next 18 months.',
    breakEvenQuarter: 'Q3 2019'
  },
  {
    symbol: 'PLTR',
    name: 'Palantir',
    description: 'Palantir turned its first quarterly profit in Q4 2022 after 17 years of operation, resulting in a 167% stock gain in the following 12 months.',
    breakEvenQuarter: 'Q4 2022'
  },
  {
    symbol: 'CRWD',
    name: 'CrowdStrike',
    description: 'CrowdStrike became profitable in 2021 after several years of losses, leading to a 300%+ gain as the company solidified its cybersecurity market position.',
    breakEvenQuarter: 'Q2 2021'
  }
];

// Symbols to preload as our initial dataset
const initialSymbols = ['TSLA', 'PLTR', 'CRWD', 'UBER', 'LYFT', 'SNAP', 'SPOT', 'PINS', 'ZM', 'PTON', 'DOCU', 'DDOG', 'NET', 'TWLO', 'SHOP'];

export default function Breakeven() {
  // State for stocks data
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [breakenStocks, setBreakenStocks] = useState<BreakenStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // State for sorting
  const [sortColumn, setSortColumn] = useState<string>('marketCapValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // State for success stories chart data
  const [successChartsData, setSuccessChartsData] = useState<Record<string, StockPerformance>>({});
  const [loadingCharts, setLoadingCharts] = useState(true);
  
  // Fetch breakeven stocks on component mount
  useEffect(() => {
    const fetchBreakenStocks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const stocks = await fetchStocksWithBreakenPattern(initialSymbols);
        setBreakenStocks(stocks);
        
        // Extract unique sectors and countries
        const uniqueSectors = [...new Set(stocks.map(stock => stock.sector))];
        const uniqueCountries = [...new Set(stocks.map(stock => stock.country))];
        setSectors(uniqueSectors);
        setCountries(uniqueCountries);
      } catch (err) {
        setError('Failed to load breakeven stocks. Please try again later.');
        console.error('Error fetching breakeven stocks:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBreakenStocks();
    fetchSuccessStoriesData();
  }, []);
  
  // Handle symbol search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchSymbols(searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching symbols:', err);
      } finally {
        setIsSearching(false);
      }
    };
    
    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  
  // Fetch performance data for success stories
  const fetchSuccessStoriesData = async () => {
    setLoadingCharts(true);
    try {
      const chartDataPromises = successStories.map(async (story) => {
        // Calculate date range around breakeven quarter
        const quarterParts = story.breakEvenQuarter.split('Q');
        const quarter = parseInt(quarterParts[1]);
        const year = parseInt(quarterParts[0]) || new Date().getFullYear();
        
        // Get quarter month (Q1=Jan, Q2=Apr, Q3=Jul, Q4=Oct)
        const month = (quarter - 1) * 3;
        
        // Calculate start date (12 months before breakeven)
        const startDate = new Date(year, month - 12, 1);
        
        // Calculate end date (12 months after breakeven or today, whichever is earlier)
        const endDate = new Date(Math.min(
          new Date(year, month + 12, 1).getTime(),
          new Date().getTime()
        ));
        
        // Format dates for API
        const period1 = startDate.toISOString();
        const period2 = endDate.toISOString();
        
        // Fetch chart data
        const chartData = await fetchChartData(story.symbol, period1, period2, '1mo');
        
        // Find index closest to breakeven quarter
        const breakEvenDate = new Date(year, month, 1);
        const breakEvenIndex = chartData.findIndex(point => 
          new Date(point.fullDate).getTime() >= breakEvenDate.getTime()
        );
        
        return {
          symbol: story.symbol,
          name: story.name,
          labels: chartData.map(point => point.date),
          prices: chartData.map(point => point.close),
          breakEvenIndex: breakEvenIndex !== -1 ? breakEvenIndex : Math.floor(chartData.length / 2)
        };
      });
      
      const results = await Promise.all(chartDataPromises);
      
      // Convert array to record object
      const chartDataRecord: Record<string, StockPerformance> = {};
      results.forEach(result => {
        chartDataRecord[result.symbol] = result;
      });
      
      setSuccessChartsData(chartDataRecord);
    } catch (err) {
      console.error('Error fetching success stories chart data:', err);
    } finally {
      setLoadingCharts(false);
    }
  };
  
  // Function to check if a stock has broken even after at least 5 losing quarters
  const fetchStocksWithBreakenPattern = async (symbols: string[]) => {
    const breakenStocks: BreakenStock[] = [];
    
    for (const symbol of symbols) {
      try {
        // Fetch quarterly earnings data for the last 3 years
        const earningsData = await fetchFundamentalsTimeSeries(
          symbol,
          '2019-01-01', // Start date
          'income_statement', // Module
          'quarterly' // Type
        );
        
        if (earningsData && earningsData.length > 6) {
          // Sort data by date (oldest first)
          const sortedData = [...earningsData].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          // Check for the breakeven pattern: 5+ losing quarters followed by profit
          let consecutiveLossesCount = 0;
          let foundBreakeven = false;
          let previousProfitQuarter = null;
          let breakEvenQuarterDate = null;
          
          for (let i = 0; i < sortedData.length - 1; i++) {
            const quarterData = sortedData[i];
            const netIncome = quarterData.netIncome;
            
            if (netIncome < 0) {
              consecutiveLossesCount++;
            } else {
              // If we found a profit after 5+ consecutive losses
              if (consecutiveLossesCount >= 5) {
                foundBreakeven = true;
                previousProfitQuarter = quarterData;
                breakEvenQuarterDate = new Date(quarterData.date);
                break;
              }
              consecutiveLossesCount = 0;
            }
          }
          
          // If we found the breakeven pattern, add it to our list
          if (foundBreakeven && previousProfitQuarter) {
            // Fetch additional company info
            const companyInfo = await searchSymbols(symbol, 1);
            
            // Fetch quote data for market cap
            const quoteData = await fetchQuoteData(symbol, 'shortName,longName,regularMarketPrice,marketCap');
            
            const lastQuarterData = sortedData[sortedData.length - 1];
            const lastQuarterProfit = lastQuarterData.netIncome;
            const profit = lastQuarterProfit ? new Intl.NumberFormat('en-US', {
              style: 'currency', 
              currency: 'USD',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(lastQuarterProfit) : 'N/A';
            
            // Format market cap
            const marketCap = quoteData.marketCap ? new Intl.NumberFormat('en-US', {
              style: 'currency', 
              currency: 'USD',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(quoteData.marketCap) : 'N/A';
            
            // Format breakeven quarter (Q1 2023, etc)
            const quarter = Math.floor(breakEvenQuarterDate!.getMonth() / 3) + 1;
            const year = breakEvenQuarterDate!.getFullYear();
            const breakEvenQuarter = `Q${quarter} ${year}`;
            
            // Calculate growth since breakeven
            const growthSince = previousProfitQuarter.netIncome && lastQuarterProfit
              ? ((lastQuarterProfit - previousProfitQuarter.netIncome) / Math.abs(previousProfitQuarter.netIncome) * 100).toFixed(1) + '%'
              : 'N/A';
            
            // Estimate next earnings (90 days from last earnings)
            const lastEarningsDate = new Date(lastQuarterData.date);
            const nextEarningsEstimate = new Date(lastEarningsDate);
            nextEarningsEstimate.setDate(nextEarningsEstimate.getDate() + 90);
            const nextEarnings = nextEarningsEstimate.toISOString().split('T')[0];
            
            breakenStocks.push({
              id: breakenStocks.length + 1,
              symbol: symbol,
              name: quoteData.shortName || companyInfo[0]?.shortName || symbol,
              country: companyInfo[0]?.country || 'United States',  // Default country
              sector: companyInfo[0]?.sector || 'Technology', // Default sector
              industry: companyInfo[0]?.industry || 'Software',
              marketCap: marketCap,
              marketCapValue: quoteData.marketCap || 0,
              lastQuarterProfit: profit,
              profitValue: lastQuarterProfit || 0,
              breakEvenQuarter: breakEvenQuarter,
              previousLosses: `${consecutiveLossesCount} quarters`,
              growthSince,
              growthValue: parseFloat(growthSince) || 0,
              nextEarnings
            });
          }   
        }
      } catch (err) {
        console.error(`Error processing ${symbol}:`, err);
      }
    }
    
    return breakenStocks;
  };
  
  const handleSelectSymbol = async (symbol: string) => {
    setSearchTerm('');
    setSearchResults([]);
    setLoading(true);
    
    try {
      const stocks = await fetchStocksWithBreakenPattern([symbol]);
      if (stocks.length > 0) {
        setBreakenStocks(prevStocks => {
          // Check if stock already exists
          const exists = prevStocks.some(stock => stock.symbol === symbol);
          if (exists) return prevStocks;
          
          const newStocks = [...prevStocks, ...stocks];
          
          // Update sectors and countries
          const uniqueSectors = [...new Set(newStocks.map(stock => stock.sector))];
          setSectors(uniqueSectors);
          
          const uniqueCountries = [...new Set(newStocks.map(stock => stock.country))];
          setCountries(uniqueCountries);
          
          return newStocks;
        });
      } else {
        // If no breakeven pattern found for the symbol
        setError(`${symbol} doesn't match the breakeven criteria (5+ losing quarters followed by profit).`);
        setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
      }
    } catch (err) {
      setError(`Failed to load data for ${symbol}.`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <FaSort className={styles.sortIcon} />;
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className={styles.sortActiveIcon} /> : 
      <FaSortDown className={styles.sortActiveIcon} />;
  };
  
  // Compute filtered and sorted stocks
  const filteredAndSortedStocks = useMemo(() => {
    // First apply filters
    let filtered = breakenStocks.filter(stock => 
      (searchTerm === '' || 
       stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
       stock.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterSector === '' || stock.sector === filterSector) &&
      (filterCountry === '' || stock.country === filterCountry)
    );
    
    // Then apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortColumn) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'country':
          comparison = a.country.localeCompare(b.country);
          break;
        case 'sector':
          comparison = a.sector.localeCompare(b.sector);
          break;
        case 'marketCapValue':
          comparison = a.marketCapValue - b.marketCapValue;
          break;
        case 'profitValue':
          comparison = a.profitValue - b.profitValue;
          break;
        case 'breakEvenQuarter':
          comparison = a.breakEvenQuarter.localeCompare(b.breakEvenQuarter);
          break;
        case 'growthValue':
          comparison = a.growthValue - b.growthValue;
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [breakenStocks, searchTerm, filterSector, filterCountry, sortColumn, sortDirection]);
  
  // Prepare distribution chart data
  const sectorDistributionData = useMemo(() => {
    const sectorCounts: {[key: string]: number} = {};
    breakenStocks.forEach(stock => {
      sectorCounts[stock.sector] = (sectorCounts[stock.sector] || 0) + 1;
    });
    
    return {
      labels: Object.keys(sectorCounts),
      datasets: [
        {
          data: Object.values(sectorCounts),
          backgroundColor: [
            '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', 
            '#4895ef', '#560bad', '#b5179e', '#f15bb5', '#9d4edd'
          ],
          borderWidth: 1
        }
      ]
    };
  }, [breakenStocks]);
  
  const countryDistributionData = useMemo(() => {
    const countryCounts: {[key: string]: number} = {};
    breakenStocks.forEach(stock => {
      countryCounts[stock.country] = (countryCounts[stock.country] || 0) + 1;
    });
    
    return {
      labels: Object.keys(countryCounts),
      datasets: [
        {
          data: Object.values(countryCounts),
          backgroundColor: [
            '#0096c7', '#0077b6', '#023e8a', '#03045e', '#00b4d8', 
            '#90e0ef', '#ade8f4', '#48cae4', '#0096c7', '#023e8a'
          ],
          borderWidth: 1
        }
      ]
    };
  }, [breakenStocks]);
  
  // Create chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  };
  
  // Line chart options for success stories
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `$${context.raw.toFixed(2)}`;
          }
        }
      },
      annotation: {
        annotations: {
          breakEvenLine: {
            type: 'line',
            xMin: 5,
            xMax: 5,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: 'Breakeven',
              enabled: true,
              position: 'top'
            }
          }
        }
      }
    }
  };
  
  // Create line chart data for a success story
  const getSuccessChartData = (symbol: string) => {
    const chartData = successChartsData[symbol];
    if (!chartData) return null;
    
    return {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.prices,
          borderColor: '#3a0ca3',
          backgroundColor: 'rgba(58, 12, 163, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.2,
          pointRadius: 2,
          pointHoverRadius: 4
        }
      ]
    };
  };
  
  const getBreakevenAnnotation = (symbol: string) => {
    const chartData = successChartsData[symbol];
    if (!chartData) return {};
    
    return {
      plugins: {
        annotation: {
          annotations: {
            breakEvenLine: {
              type: 'line',
              xMin: chartData.breakEvenIndex,
              xMax: chartData.breakEvenIndex,
              borderColor: '#f72585',
              borderWidth: 2,
              label: {
                content: 'Breakeven',
                enabled: true,
                position: 'top',
                backgroundColor: '#f72585'
              }
            }
          }
        }
      }
    };
  };
  
  return (
    <Layout>
      <ProtectedRoute>
        <div>
          <Head>
            <title>Breakeven Stocks | OptiWise</title>
            <meta name="description" content="Discover stocks that have turned profitable after multiple losing quarters" />
          </Head>
          
          <main className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
              <div className={styles.title}>
                <div className={styles.iconContainer}>
                  <FaBalanceScale size={24} />
                </div>
                Breakeven Stocks Analysis
              </div>
              
              <p className={styles.description}>
                Discover companies that have recently achieved profitability after extended periods of losses.
                These "breakeven stocks" often represent inflection points in a company's growth trajectory and
                can present unique investment opportunities as they transition from burning cash to generating profits.
              </p>
              
              <div className={styles.infoAlert}>
                <FaInfoCircle className={styles.infoIcon} />
                <span>Past performance doesn't guarantee future results. Always conduct thorough research before investing.</span>
              </div>
            </div>
            
            {error && (
              <div className={styles.errorMessage}>
                <FaInfoCircle className={styles.errorIcon} />
                {error}
              </div>
            )}
            
            {/* Filter Section */}
            <div className={styles.filterBar}>
              <h2 className={styles.sectionTitle}>Breakeven Stock Screener</h2>
              
              <div className={styles.filterSection}>
                <div className={styles.searchWrapper}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by symbol or company name"
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {isSearching && (
                    <FaSpinner className={`${styles.spinnerIcon} ${styles.spinning}`} />
                  )}
                  
                  {searchResults.length > 0 && searchTerm.length >= 2 && (
                    <div className={styles.searchResults}>
                      {searchResults.map((result, index) => (
                        <div 
                          key={index} 
                          className={styles.searchResultItem}
                          onClick={() => handleSelectSymbol(result.symbol)}
                        >
                          <div className={styles.resultSymbol}>{result.symbol}</div>
                          <div className={styles.resultName}>{result.shortName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={styles.selectWrapper}>
                  <FaFilter className={styles.selectIcon} />
                  <select
                    className={styles.select}
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                  >
                    <option value="">All Sectors</option>
                    {sectors.map((sector, index) => (
                      <option key={index} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.selectWrapper}>
                  <FaGlobeAmericas className={styles.selectIcon} />
                  <select
                    className={styles.select}
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                  >
                    <option value="">All Countries</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Table Section */}
            {loading ? (
              <div className={styles.loadingContainer}>
                <FaSpinner className={`${styles.spinnerLarge} ${styles.spinning}`} />
                <p>Analyzing earnings data to find breakeven stocks...</p>
              </div>
            ) : filteredAndSortedStocks.length > 0 ? (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('symbol')} className={styles.sortableHeader}>
                        Symbol / Company {getSortIcon('symbol')}
                      </th>
                      <th onClick={() => handleSort('country')} className={styles.sortableHeader}>
                        Country {getSortIcon('country')}
                      </th>
                      <th onClick={() => handleSort('sector')} className={styles.sortableHeader}>
                        Sector {getSortIcon('sector')}
                      </th>
                      <th onClick={() => handleSort('marketCapValue')} className={styles.sortableHeader}>
                        Market Cap {getSortIcon('marketCapValue')}
                      </th>
                      <th onClick={() => handleSort('breakEvenQuarter')} className={styles.sortableHeader}>
                        Breakeven Quarter {getSortIcon('breakEvenQuarter')}
                      </th>
                      <th onClick={() => handleSort('profitValue')} className={styles.sortableHeader}>
                        Last Quarter Profit {getSortIcon('profitValue')}
                      </th>
                      <th onClick={() => handleSort('growthValue')} className={styles.sortableHeader}>
                        Growth Since {getSortIcon('growthValue')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedStocks.map((stock) => (
                      <tr key={stock.id}>
                        <td>
                          <div className={styles.symbol}>{stock.symbol}</div>
                          <div className={styles.company}>{stock.name}</div>
                        </td>
                        <td>
                          <div className={styles.country}>{stock.country}</div>
                        </td>
                        <td>
                          <div className={styles.sector}>{stock.sector}</div>
                          <div className={styles.industry}>{stock.industry}</div>
                        </td>
                        <td>
                          <div className={styles.marketCap}>{stock.marketCap}</div>
                        </td>
                        <td>
                          <div className={styles.quarterTag}>{stock.breakEvenQuarter}</div>
                          <div className={styles.lossesInfo}>{stock.previousLosses} of losses</div>
                        </td>
                        <td>
                          <div className={styles.profitValue}>{stock.lastQuarterProfit}</div>
                        </td>
                        <td>
                          <div className={styles.growth}>
                            <FaArrowUp />
                            {stock.growthSince}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.noResults}>
                <p>No breakeven stocks found that match your filters.</p>
                <p>Try searching for a different company or adjusting your filter criteria.</p>
              </div>
            )}
            
            {/* Success Stories Section */}
            <section className={styles.successStoriesSection}>
              <h2 className={styles.sectionTitle}>Success Stories</h2>
              <p className={styles.sectionDescription}>
                These companies demonstrated remarkable performance after achieving profitability.
                Their journeys illustrate how the transition from loss to profit can mark a significant inflection point in stock performance.
              </p>
              
              <div className={styles.successStoriesGrid}>
                {successStories.map((story, index) => (
                  <div key={index} className={styles.successStoryCard}>
                    <div className={styles.storyHeader}>
                      <div className={styles.storyTitle}>
                        <span className={styles.storySymbol}>{story.symbol}</span>
                        <span className={styles.storyName}>{story.name}</span>
                      </div>
                      <div className={styles.storyQuarter}>{story.breakEvenQuarter}</div>
                    </div>
                    
                    <div className={styles.storyDescription}>{story.description}</div>
                    
                    <div className={styles.storyChartContainer}>
                      {loadingCharts ? (
                        <div className={styles.chartLoading}>
                          <FaSpinner className={`${styles.spinnerMedium} ${styles.spinning}`} />
                          <span>Loading chart...</span>
                        </div>
                      ) : successChartsData[story.symbol] ? (
                        <Line 
                          data={getSuccessChartData(story.symbol)!} 
                          options={{
                            ...lineChartOptions,
                            ...getBreakevenAnnotation(story.symbol)
                          }}
                          height={150}
                        />
                      ) : (
                        <div className={styles.chartError}>Chart data unavailable</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Distributions Section */}
            <section className={styles.distributionsSection}>
              <h2 className={styles.sectionTitle}>Breakeven Stocks Distribution</h2>
              <div className={styles.chartGrid}>
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>
                    <FaChartPie className={styles.chartIcon} />
                    Sector Distribution
                  </h3>
                  <div className={styles.chartContainer}>
                    {breakenStocks.length > 0 ? (
                      <Pie data={sectorDistributionData} options={pieChartOptions} />
                    ) : (
                      <div className={styles.chartLoading}>No data available</div>
                    )}
                  </div>
                </div>
                
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>
                    <FaGlobeAmericas className={styles.chartIcon} />
                    Geographic Distribution
                  </h3>
                  <div className={styles.chartContainer}>
                    {breakenStocks.length > 0 ? (
                      <Pie data={countryDistributionData} options={pieChartOptions} />
                    ) : (
                      <div className={styles.chartLoading}>No data available</div>
                    )}
                  </div>
                </div>
              </div>
            </section>
            
            {/* Investment Strategy Section */}
            <section className={styles.investmentStrategySection}>
              <h2 className={styles.sectionTitle}>Investment Strategy</h2>
              
              <div className={styles.strategyGrid}>
                <div className={styles.strategyCard}>
                  <h3 className={styles.strategyTitle}>
                    <div className={styles.strategyIcon}>
                      <FaLightbulb />
                    </div>
                    How to Identify Promising Breakeven Stocks
                  </h3>
                  <ul className={styles.strategyList}>
                    <li>Look for companies with consistent revenue growth despite historical losses</li>
                    <li>Prioritize businesses with improving gross margins prior to breakeven</li>
                    <li>Consider market leaders in emerging sectors with clear paths to profitability</li>
                    <li>Evaluate management's execution against stated profitability timelines</li>
                    <li>Examine if the profitability is sustainable or a one-time event</li>
                  </ul>
                </div>
                
                <div className={styles.strategyCard}>
                  <h3 className={styles.strategyTitle}>
                    <div className={styles.strategyIcon} style={{backgroundColor: '#4361ee'}}>
                      <FaChartLine />
                    </div>
                    Focus on Smaller Market Cap Companies
                  </h3>
                  <p className={styles.strategyText}>
                    Smaller companies (under $2B market cap) often experience more significant price appreciation after reaching profitability:
                  </p>
                  <ul className={styles.strategyList}>
                    <li>Less analyst coverage means greater potential for undervaluation</li>
                    <li>Institutional investors often increase positions once profitability is achieved</li>
                    <li>Smaller companies have more room to grow into their valuations</li>
                    <li>Potential for inclusion in indices and ETFs after demonstrating consistent profitability</li>
                  </ul>
                </div>
                
                <div className={styles.strategyCard}>
                  <h3 className={styles.strategyTitle}>
                    <div className={styles.strategyIcon} style={{backgroundColor: '#f72585'}}>
                      <FaExclamationTriangle />
                    </div>
                    Risk Considerations
                  </h3>
                  <ul className={styles.strategyList}>
                    <li>Initial profitability may not be sustainable without recurring revenue streams</li>
                    <li>High-growth companies may sacrifice profitability again to pursue market share</li>
                    <li>Reduced growth rates can follow focus on profitability</li>
                    <li>Economic downturns can quickly reverse newly achieved profitability</li>
                    <li>Market expectations often rise significantly after breakeven, increasing volatility</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Conclusion Section */}
            <section className={styles.conclusionSection}>
              <h2 className={styles.sectionTitle}>Why Breakeven Stocks Matter</h2>
              <div className={styles.conclusionContent}>
                <p>
                  The transition to profitability represents a fundamental inflection point in a company's financial trajectory.
                  For investors, this shift often signals the maturation of a business model and validation of a company's value proposition.
                  Historically, many of today's market leaders experienced significant share price appreciation in the months and years
                  following their initial breakeven quarter.
                </p>
                
                <p>
                  While not all breakeven stocks will become market winners, this screener provides a starting point for identifying
                  companies at this critical juncture. The most successful investors in this category focus on businesses with scalable
                  models, expanding margins, and sustainable competitive advantages that can translate initial profitability into
                  long-term shareholder returns.
                </p>
                
                <div className={styles.disclaimer}>
                  <FaInfoCircle className={styles.disclaimerIcon} />
                  <p>
                    <strong>Disclaimer:</strong> The information provided is for educational purposes only and does not constitute investment advice.
                    Past performance is not indicative of future results. Always conduct your own research and consider your financial situation
                    before making any investment decisions.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
