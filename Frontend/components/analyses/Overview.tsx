import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown, FaInfoCircle, FaDownload, FaExpand, FaQuestion, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import styles from '../../styles/Analyses.module.css';

// Sample data for charts
const annualData = {
  labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
  datasets: [{
    label: 'Annual Return (%)',
    data: [12, -5, 18, 7, 22, -8, 14, -3, 25, 10, 5],
    backgroundColor: (context: { dataset: { data: { [x: string]: any; }; }; dataIndex: string | number; }) => {
      const value = context.dataset.data[context.dataIndex];
      return value >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)';
    }
  }]
};

// Interface for chart data
interface ChartDataPoint {
  timestamp: number;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  date?: string; // Formatted date string
}

// Performance periods data
const performancePeriods = [
  { label: '1M', value: -2.5, months: 1 },
  { label: '3M', value: 5.7, months: 3 },
  { label: '6M', value: 12.3, months: 6 },
  { label: '1Y', value: -8.2, months: 12 },
  { label: '3Y', value: 45.6, months: 36 },
  { label: '5Y', value: 78.2, months: 60 },
  { label: '10Y', value: 134.5, months: 120 },
  { label: '20Y', value: 267.8, months: 240 },
];

// Sample trend data for fallback
const trendData = {
  labels: Array.from({ length: 120 }, (_, i) => `${2015 + Math.floor(i/12)}-${(i % 12) + 1}`),
  datasets: [{
    label: 'Asset Price ($)',
    data: Array.from({ length: 120 }, () => Math.floor(Math.random() * 500) + 100),
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1,
    fill: false
  }]
};

interface OverviewProps {
  symbol: string;
}

const Overview: React.FC<OverviewProps> = ({ symbol }) => {
  // State management moved from analyses.tsx
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assetInfo, setAssetInfo] = useState<{ name: string; symbol: string }>({ 
    name: 'Loading...', 
    symbol: symbol || 'AAPL'
  });
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');

  // Fetch chart data based on the symbol and selected period
  useEffect(() => {
    const fetchChartData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Calculate date range based on selected period
        const selectedPeriodObj = performancePeriods.find(p => p.label === selectedPeriod);
        const monthsToShow = selectedPeriodObj ? selectedPeriodObj.months : 120; // Default to 10 years
        
        // Calculate start date based on months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - monthsToShow);
        
        // Determine appropriate interval based on period length
        let interval = '1d';
        const response = await axios.get('http://localhost:3001/api/finance/chart', {
          params: {
            symbol,
            period1: startDate.toISOString(),
            period2: endDate.toISOString(),
            interval,
            events: 'div,split',
            includePrePost: false
          }
        });
        
        if (response.data && response.data.chart && response.data.chart.result && response.data.chart.result[0]) {
          const result = response.data.chart.result[0];
          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];
          const meta = result.meta;
          
          // Update asset info
          setAssetInfo({
            name: meta.symbol,
            symbol: meta.symbol
          });
          
          // Format data for chart
          const formattedData = timestamps.map((timestamp: number, index: number) => {
            const date = new Date(timestamp * 1000);
            return {
              timestamp,
              close: quotes.close[index],
              open: quotes.open[index],
              high: quotes.high[index],
              low: quotes.low[index],
              volume: quotes.volume[index],
              date: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
            };
          }).filter((point: { close: null | undefined; }) => point.close !== null && point.close !== undefined);
          
          setChartData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (symbol) {
      fetchChartData();
      
      // Also make a simple quote request to get the asset name
      axios.get(`http://localhost:3001/api/finance/quote?symbol=${symbol}&fields=shortName,longName,regularMarketPrice`)
        .then(response => {
          if (response.data && response.data[0]) {
            const quote = response.data[0];
            setAssetInfo({
              name: quote.shortName || quote.longName || symbol,
              symbol: quote.symbol
            });
          }
        })
        .catch(err => console.error('Error fetching quote data:', err));
    }
  }, [symbol, selectedPeriod]);

  // Create chart data from API response
  const realTrendData = useMemo(() => {
    if (chartData.length === 0) return trendData; // Use mock data as fallback
    
    // Filter data to appropriate number of points
    const dataPoints = chartData;
    
    return {
      labels: dataPoints.map(point => point.date),
      datasets: [{
        label: 'Asset Price ($)',
        data: dataPoints.map(point => point.close),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      }]
    };
  }, [chartData]);

  // Filter trend data based on selected period - replace with real data
  const filteredTrendData = useMemo(() => {
    if (chartData.length > 0) {
      return realTrendData; // Use real data when available
    }
    
    // Fallback to mock data when API data is not available
    const selectedPeriodObj = performancePeriods.find(p => p.label === selectedPeriod);
    const monthsToShow = selectedPeriodObj ? selectedPeriodObj.months : 120;
    
    const startIndex = Math.max(0, trendData.labels.length - monthsToShow);
    
    return {
      labels: trendData.labels.slice(startIndex),
      datasets: [{
        ...trendData.datasets[0],
        data: trendData.datasets[0].data.slice(startIndex)
      }]
    };
  }, [selectedPeriod, chartData, realTrendData]);

  return (
    <div className={styles.overviewTab}>
      {/* Overview Header Section */}
      <div className={styles.seasonalityHeader}>
        <h1>Performance Overview for {assetInfo.name}</h1>
        <p className={styles.seasonalityDescription}>
          <FaInfoCircle className={styles.infoIcon} /> 
          Track historical performance trends and compare returns across different timeframes to make 
          informed investment decisions.
        </p>
      </div>

      {/* Time Period Selection */}
      <div className={styles.periodSelectionBar}>
        <h2>Select Time Period</h2>
        <div className={styles.periodToggle}>
          {performancePeriods.map((period) => (
            <button 
              key={period.label}
              className={`${styles.modernTabButton} ${selectedPeriod === period.label ? styles.activeTab : ''}`}
              onClick={() => setSelectedPeriod(period.label)}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>{selectedPeriod} Price Trend for {assetInfo.symbol}</h2>
          <div className={styles.chartControls}>
            <button className={styles.modernActionButton} title="Download Chart">
              <FaDownload className={styles.buttonIcon} /> 
              <span>Download</span>
            </button>
            <button className={styles.modernActionButton} title="Fullscreen">
              <FaExpand className={styles.buttonIcon} /> 
              <span>Fullscreen</span>
            </button>
            <button className={styles.modernIconButton} title="Learn More">
              <FaQuestion />
            </button>
          </div>
        </div>
        <div className={styles.trendChart}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading chart data...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : (
            <Line 
              data={filteredTrendData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                  line: {
                    tension: 0.3
                  },
                  point: {
                    radius: 0, // Hide points for cleaner look with real data
                    hoverRadius: 5
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: 'rgba(200, 200, 200, 0.1)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      maxTicksLimit: 12, // Limit x-axis labels
                      autoSkip: true
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 'bold'
                    },
                    bodyFont: {
                      size: 13
                    }
                  }
                }
              }}
              height={400}
            />
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <h2>Performance Metrics</h2>
          <button className={styles.modernIconButton} title="Learn About Performance Metrics">
            <FaInfoCircle />
          </button>
        </div>
        <div className={styles.metricsGrid}>
          {performancePeriods.map((period) => (
            <div 
              key={period.label} 
              className={`${styles.metricCard} ${period.value >= 0 ? styles.positive : styles.negative} ${selectedPeriod === period.label ? styles.selectedPeriod : ''}`}
              onClick={() => setSelectedPeriod(period.label)}
            >
              <div className={styles.metricHeader}>
                <span className={styles.periodLabel}>{period.label}</span>
                {selectedPeriod === period.label && <span className={styles.activeBadge}>Active</span>}
              </div>
              <div className={styles.returnValue}>
                {period.value >= 0 ? <FaArrowUp className={styles.upIcon} /> : <FaArrowDown className={styles.downIcon} />}
                <span>{Math.abs(period.value).toFixed(1)}%</span>
              </div>
              <div className={styles.metricFooter}>
                <span>vs. previous</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Performance */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>Annual Performance</h2>
          <div className={styles.chartControls}>
            <button className={styles.modernIconButton} title="Fullscreen">
              <FaExpand />
            </button>
            <button className={styles.modernIconButton} title="Learn More">
              <FaQuestion />
            </button>
          </div>
        </div>
        <div className={styles.annualChart}>
          <Bar 
            data={annualData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  grid: {
                    color: 'rgba(200, 200, 200, 0.1)'
                  },
                  title: {
                    display: true,
                    text: 'Annual Return (%)',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 13
                  }
                }
              }
            }}
            height={300}
          />
        </div>
        <div className={styles.chartSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Best Year:</span>
            <span className={styles.summaryValue}>2021 (+25%)</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Worst Year:</span>
            <span className={styles.summaryValue}>2018 (-8%)</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Average:</span>
            <span className={styles.summaryValue}>+8.8%</span>
          </div>
        </div>
      </div>
      
      {/* Key Stats Card */}
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <h2>Key Statistics</h2>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaArrowUp /></div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>$69,000</div>
              <div className={styles.statLabel}>All Time High</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaArrowDown /></div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>$3,200</div>
              <div className={styles.statLabel}>All Time Low</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaChartLine /></div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>98.7%</div>
              <div className={styles.statLabel}>Profit Days</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaCalendarAlt /></div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>2.8 Years</div>
              <div className={styles.statLabel}>Avg Hold Period</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
