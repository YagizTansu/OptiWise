import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../components/Layout'
import styles from '../styles/Analyses.module.css';
import { FaRobot, FaChartLine, FaCalendarAlt, FaUsers, FaArrowUp, FaArrowDown, FaSearch, FaBars, 
  FaCircle, FaEye, FaInfoCircle, FaDownload, FaExpand, FaQuestion, FaExchangeAlt, FaHistory } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Overview from '../components/analyses/Overview';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

// Sample data for charts
const trendData = {
  labels: Array.from({ length: 120 }, (_, i) => `${2013 + Math.floor(i/12)}-${(i % 12) + 1}`),
  datasets: [{
    label: 'Asset Price ($)',
    data: Array.from({ length: 120 }, () => Math.floor(Math.random() * 500) + 100),
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1,
    fill: false
  }]
};

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

// Sample seasonality data
const monthlySeasonalityData = {
  labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  datasets: [
    {
      label: '3 Years',
      data: [5.2, 3.7, -2.1, 4.5, 2.8, -1.3, 3.9, 4.2, 2.5, -3.1, 1.8, 3.6],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
    {
      label: '5 Years',
      data: [4.1, 2.9, -1.5, 3.8, 1.9, -0.8, 4.7, 3.5, 2.0, -2.5, 1.2, 2.8],
      borderColor: 'rgb(255, 159, 64)',
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
    }
  ]
};

const dailyAverageData = {
  labels: Array.from({length: 31}, (_, i) => (i + 1).toString()),
  datasets: [
    {
      label: '3 Years',
      data: Array.from({length: 31}, () => (Math.random() * 30) - 15),
      backgroundColor: 'rgba(53, 162, 235, 0.7)',
    },
    {
      label: '5 Years',
      data: Array.from({length: 31}, () => (Math.random() * 30) - 15),
      backgroundColor: 'rgba(255, 159, 64, 0.7)',
    }
  ]
};

const weeklyAverageData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      label: '3 Years',
      data: [2.1, -1.4, 3.5, 1.8, -0.7],
      backgroundColor: 'rgba(53, 162, 235, 0.7)',
    },
    {
      label: '5 Years',
      data: [1.5, -0.9, 2.8, 1.2, -1.1],
      backgroundColor: 'rgba(255, 159, 64, 0.7)',
    }
  ]
};

const monthlyAverageData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: '3 Years',
      data: [2.8, -1.3, 3.9, 4.2, 2.5, -3.1, 1.8, 3.6, 5.2, 3.7, -2.1, 4.5],
      backgroundColor: 'rgba(53, 162, 235, 0.7)',
    },
    {
      label: '5 Years',
      data: [1.9, -0.8, 4.7, 3.5, 2.0, -2.5, 1.2, 2.8, 4.1, 2.9, -1.5, 3.8],
      backgroundColor: 'rgba(255, 159, 64, 0.7)',
    }
  ]
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

export default function Analyses() {
  const router = useRouter();
  const { symbol = 'AAPL' } = router.query; // Default to AAPL if no symbol provided
  
  // Add state for API data
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assetInfo, setAssetInfo] = useState<{ name: string; symbol: string }>({ 
    name: 'Loading...', 
    symbol: (symbol as string) || 'AAPL'
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('10Y'); // Default to 10 years view
  const [comparisonPeriods, setComparisonPeriods] = useState({ first: '3 Years', second: '5 Years' });
  const [activeTimeframe, setActiveTimeframe] = useState('monthly'); // New state for seasonality timeframe
  const [showDataPoints, setShowDataPoints] = useState(true); // Toggle data points
  const [viewMode, setViewMode] = useState('line'); // Toggle between line and bar chart

  // Sample COT data for tables
  const positionExtremesData = [
    {
      traderType: 'Large Speculators',
      highestLong: { value: '+126,789', date: 'May 2023', price: '$32,450' },
      highestShort: { value: '-42,567', date: 'Jan 2022', price: '$49,875' },
      currentPosition: { value: '+89,452', change: '+12.5%', direction: 'increasing' }
    },
    {
      traderType: 'Commercial Traders',
      highestLong: { value: '+58,921', date: 'Dec 2021', price: '$47,240' },
      highestShort: { value: '-137,456', date: 'May 2023', price: '$32,450' },
      currentPosition: { value: '-63,287', change: '-8.7%', direction: 'decreasing' }
    },
    {
      traderType: 'Small Speculators',
      highestLong: { value: '+24,567', date: 'Apr 2023', price: '$28,350' },
      highestShort: { value: '-19,876', date: 'Nov 2022', price: '$16,570' },
      currentPosition: { value: '+3,835', change: '+2.1%', direction: 'stable' }
    }
  ];

  const sentimentData = [
    {
      traderCategory: 'Large Speculators',
      sentiment: 'bullish',
      netPosition: '+89,452',
      change: '+12.5%',
      longPercentage: '67%',
      description: 'Largest net long position in 6 months. Typically signals strong upward momentum.'
    },
    {
      traderCategory: 'Commercial Traders',
      sentiment: 'bearish',
      netPosition: '-63,287',
      change: '-8.7%',
      longPercentage: '42%',
      description: 'Increased short positions over past 3 weeks. Often hedge against market downturns.'
    },
    {
      traderCategory: 'Small Speculators',
      sentiment: 'neutral',
      netPosition: '+3,835',
      change: '+2.1%',
      longPercentage: '51%',
      description: 'Nearly balanced positions indicate uncertainty among retail traders.'
    },
    {
      traderCategory: 'Overall Market',
      sentiment: 'bullish',
      netPosition: '+30,000',
      change: '+5.4%',
      longPercentage: '56%',
      description: 'Divergence between trader categories suggests potential volatility ahead.'
    }
  ];

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
        if (monthsToShow > 60) interval = '1wk';
        if (monthsToShow > 120) interval = '1mo';
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
        debugger
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
              name: quote.shortName || quote.longName || (symbol as string),
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

  // Function to get the current seasonality data based on the timeframe
  const getCurrentSeasonalityData = () => {
    switch(activeTimeframe) {
      case 'daily':
        return dailyAverageData;
      case 'weekly':
        return weeklyAverageData;
      case 'yearly':
        return {
          labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
          datasets: [
            {
              label: '3 Years',
              data: [12.5, -5.2, 34.7, 28.9, -15.3, 42.1],
              backgroundColor: 'rgba(53, 162, 235, 0.7)',
            },
            {
              label: '5 Years',
              data: [8.3, -3.1, 22.6, 18.5, -10.2, 31.7],
              backgroundColor: 'rgba(255, 159, 64, 0.7)',
            }
          ]
        };
      case 'monthly':
      default:
        return monthlySeasonalityData;
    }
  };

  // Get chart title based on timeframe
  const getChartTitle = () => {
    switch(activeTimeframe) {
      case 'daily':
        return 'Daily Seasonality';
      case 'weekly':
        return 'Weekly Seasonality';
      case 'yearly':
        return 'Yearly Seasonality';
      case 'monthly':
      default:
        return 'Monthly Seasonality';
    }
  };

  // Chart options with data points toggle
  const seasonalityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: showDataPoints ? 4 : 0,
        hoverRadius: showDataPoints ? 6 : 0
      },
      line: {
        borderWidth: 2,
        tension: 0.3
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Percent Change (%)',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        }
      }
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 700
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        usePointStyle: true
      },
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  // Generate correlation data visuals
  const correlationData = {
    labels: ['Correlation', 'No Correlation'],
    datasets: [
      {
        data: [50.06, 49.94],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(230, 230, 230, 0.5)'],
        borderWidth: 0,
        cutout: '75%'
      }
    ]
  };

  const correlation2Data = {
    labels: ['Correlation', 'No Correlation'],
    datasets: [
      {
        data: [38.98, 61.02],
        backgroundColor: ['rgba(255, 159, 64, 0.8)', 'rgba(230, 230, 230, 0.5)'],
        borderWidth: 0,
        cutout: '75%'
      }
    ]
  };

  return (
    <Layout>
      {/* Navigation bar - Same as in index.tsx */}

      <div className={styles.analysesContainer}>
        {/* Header with Asset Name and AI Button */}
        <div className={styles.header}>
          <h1 className={styles.assetName}>{assetInfo.name} ({assetInfo.symbol})</h1>
          <button className={styles.aiButton}>
            <FaRobot /> Forecast AI AGENT
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'seasonality' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('seasonality')}
          >
            <FaCalendarAlt /> Seasonality
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'cot' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('cot')}
          >
            <FaUsers /> COT Report
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Overview 
              assetInfo={assetInfo}
              performancePeriods={performancePeriods}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              chartData={chartData}
              isLoading={isLoading}
              error={error}
              trendData={trendData}
            />
          )}

          {/* Seasonality Tab */}
          {activeTab === 'seasonality' && (
            <div className={styles.seasonalityTab}>
              <div className={styles.seasonalityHeader}>
                <h1>Seasonality Analysis for {assetInfo.name}</h1>
                <p className={styles.seasonalityDescription}>
                  <FaInfoCircle className={styles.infoIcon} /> 
                  Seasonality analysis helps identify recurring patterns in asset price movements during specific 
                  time periods. Use this data to optimize your entry and exit points.
                </p>
              </div>
              
              <div className={styles.seasonalityControls}>
                <div className={styles.viewControls}>
                  <button 
                    className={`${styles.modernButton} ${viewMode === 'line' ? styles.activeMod : ''}`}
                    title="Line Chart View" 
                    onClick={() => setViewMode('line')}
                  >
                    <FaChartLine className={styles.buttonIcon} /> 
                    <span>Line</span>
                  </button>
                  <button 
                    className={`${styles.modernButton} ${viewMode === 'bar' ? styles.activeMod : ''}`}
                    title="Bar Chart View"
                    onClick={() => setViewMode('bar')}
                  >
                    <FaChartLine className={styles.buttonIcon} /> 
                    <span>Bar</span>
                  </button>
                  <button 
                    className={`${styles.modernButton} ${showDataPoints ? styles.activeMod : ''}`}
                    title="Toggle Data Points"
                    onClick={() => setShowDataPoints(!showDataPoints)}
                  >
                    <FaCircle className={styles.buttonIcon} /> 
                    <span>Points</span>
                  </button>
                </div>
                
                <div className={styles.comparisonSelector}>
                  <div className={styles.periodSelectorWrapper}>
                    <label htmlFor="firstPeriod">Primary Period:</label>
                    <select 
                      id="firstPeriod"
                      className={styles.periodSelect}
                      value={comparisonPeriods.first}
                      onChange={(e) => setComparisonPeriods({...comparisonPeriods, first: e.target.value})}
                    >
                      <option value="3 Years">3 Years</option>
                      <option value="5 Years">5 Years</option>
                      <option value="10 Years">10 Years</option>
                    </select>
                  </div>
                  
                  <div className={styles.vsIndicator}>vs</div>
                  
                  <div className={styles.periodSelectorWrapper}>
                    <label htmlFor="secondPeriod">Compare With:</label>
                    <select 
                      id="secondPeriod"
                      className={styles.periodSelect}
                      value={comparisonPeriods.second}
                      onChange={(e) => setComparisonPeriods({...comparisonPeriods, second: e.target.value})}
                    >
                      <option value="3 Years">3 Years</option>
                      <option value="5 Years">5 Years</option>
                      <option value="10 Years">10 Years</option>
                    </select>
                  </div>
                </div>
                
                <div className={styles.seasonalityTimeframeSelector}>
                  <button 
                    className={`${styles.modernTabButton} ${activeTimeframe === 'daily' ? styles.activeTab : ''}`}
                    title="Daily View"
                    onClick={() => setActiveTimeframe('daily')}
                  >
                    <span>Daily</span>
                  </button>
                  <button 
                    className={`${styles.modernTabButton} ${activeTimeframe === 'weekly' ? styles.activeTab : ''}`}
                    title="Weekly View"
                    onClick={() => setActiveTimeframe('weekly')}
                  >
                    <span>Weekly</span>
                  </button>
                  <button 
                    className={`${styles.modernTabButton} ${activeTimeframe === 'monthly' ? styles.activeTab : ''}`}
                    title="Monthly View"
                    onClick={() => setActiveTimeframe('monthly')}
                  >
                    <span>Monthly</span>
                  </button>
                  <button 
                    className={`${styles.modernTabButton} ${activeTimeframe === 'yearly' ? styles.activeTab : ''}`}
                    title="Yearly View"
                    onClick={() => setActiveTimeframe('yearly')}
                  >
                    <span>Yearly</span>
                  </button>
                </div>
              </div>

              {/* Primary Comparison Chart */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h2>{getChartTitle()} Comparison</h2>
                  <div className={styles.chartControls}>
                    <button className={styles.modernActionButton} title="Download Chart">
                      <FaDownload className={styles.buttonIcon} /> 
                      <span>Download</span>
                    </button>
                    <button className={styles.modernActionButton} title="Fullscreen">
                      <FaExpand className={styles.buttonIcon} /> 
                      <span>Fullscreen</span>
                    </button>
                    <button className={styles.modernIconButton} title="Learn About Seasonality">
                      <FaQuestion />
                    </button>
                  </div>
                </div>
                <div className={styles.comparisonChart}>
                  {viewMode === 'line' ? (
                    <Line 
                      data={getCurrentSeasonalityData()}
                      options={seasonalityChartOptions}
                      height={300}
                    />
                  ) : (
                    <Bar
                      data={getCurrentSeasonalityData()}
                      options={seasonalityChartOptions}
                      height={300}
                    />
                  )}
                </div>
              </div>

              {/* Correlation Data with improved visuals */}
              <div className={styles.correlationSection}>
                <div className={styles.sectionHeader}>
                  <h2>Pattern Correlation</h2>
                  <button className={styles.modernIconButton} title="Learn About Correlation">
                    <FaQuestion />
                  </button>
                </div>
                
                <div className={styles.correlationMetrics}>
                  <div className={styles.compactCorrelationCard}>
                    <h3>{comparisonPeriods.first} Correlation</h3>
                    <div className={styles.correlationVisual}>
                      <div className={styles.smallDonutContainer}>
                        <Doughnut 
                          data={correlationData}
                          options={{
                            responsive: true,
                            cutout: '75%',
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false }
                            }
                          }}
                          height={120}
                          width={120}
                        />
                        <div className={styles.correlationValueCompact}>50.06%</div>
                      </div>
                      <div className={styles.correlationDescription}>
                        <p>Medium correlation strength suggests moderate historical pattern consistency.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.compactCorrelationCard}>
                    <h3>{comparisonPeriods.second} Correlation</h3>
                    <div className={styles.correlationVisual}>
                      <div className={styles.smallDonutContainer}>
                        <Doughnut 
                          data={correlation2Data}
                          options={{
                            responsive: true,
                            cutout: '75%',
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false }
                            }
                          }}
                          height={120}
                          width={120}
                        />
                        <div className={styles.correlationValueCompact}>38.98%</div>
                      </div>
                      <div className={styles.correlationDescription}>
                        <p>Weak correlation indicates less reliable historical patterns over this period.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time-Based Analysis Cards */}
              <div className={styles.timeAnalysisSection}>
                <div className={styles.sectionHeader}>
                  <h2>Average Returns by Time Period</h2>
                  <div className={styles.periodToggle}>
                    <button className={`${styles.modernTabButton} ${styles.active}`}>3 Years</button>
                    <button className={styles.modernTabButton}>5 Years</button>
                    <button className={styles.modernTabButton}>10 Years</button>
                  </div>
                </div>
                
                <div className={styles.analysisCards}>
                  {/* Daily Average Analysis */}
                  <div className={styles.analysisCard}>
                    <div className={styles.cardHeader}>
                      <h3>Daily Average</h3>
                      <div className={styles.cardActions}>
                        <button className={styles.modernIconButton}><FaExpand /></button>
                        <button className={styles.modernIconButton}><FaInfoCircle /></button>
                      </div>
                    </div>
                    <div className={styles.averageChart}>
                      <Bar 
                        data={dailyAverageData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              align: 'end',
                              labels: {
                                boxWidth: 12,
                                usePointStyle: true
                              }
                            },
                          },
                          scales: {
                            y: {
                              min: -50,
                              max: 50,
                              title: {
                                display: true,
                                text: 'Percent (%)'
                              }
                            }
                          }
                        }}
                        height={180}
                      />
                    </div>
                    <div className={styles.bestWorstDays}>
                      <div className={styles.bestDay}>
                        <span>Best: </span>Day 15 (+8.3%)
                      </div>
                      <div className={styles.worstDay}>
                        <span>Worst: </span>Day 22 (-7.9%)
                      </div>
                    </div>
                  </div>

                  {/* Weekly Average Analysis */}
                  <div className={styles.analysisCard}>
                    <div className={styles.cardHeader}>
                      <h3>Weekly Average</h3>
                      <div className={styles.cardActions}>
                        <button className={styles.modernIconButton}><FaExpand /></button>
                        <button className={styles.modernIconButton}><FaInfoCircle /></button>
                      </div>
                    </div>
                    <div className={styles.averageChart}>
                      <Bar 
                        data={weeklyAverageData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              align: 'end',
                              labels: {
                                boxWidth: 12,
                                usePointStyle: true
                              }
                            },
                          },
                          scales: {
                            y: {
                              title: {
                                display: true,
                                text: 'Percent (%)'
                              }
                            }
                          }
                        }}
                        height={180}
                      />
                    </div>
                    <div className={styles.bestWorstDays}>
                      <div className={styles.bestDay}>
                        <span>Best: </span>Wednesday (+3.5%)
                      </div>
                      <div className={styles.worstDay}>
                        <span>Worst: </span>Tuesday (-1.4%)
                      </div>
                    </div>
                  </div>

                  {/* Monthly Average Analysis */}
                  <div className={styles.analysisCard}>
                    <div className={styles.cardHeader}>
                      <h3>Monthly Average</h3>
                      <div className={styles.cardActions}>
                        <button className={styles.modernIconButton}><FaExpand /></button>
                        <button className={styles.modernIconButton}><FaInfoCircle /></button>
                      </div>
                    </div>
                    <div className={styles.averageChart}>
                      <Bar 
                        data={monthlyAverageData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              align: 'end',
                              labels: {
                                boxWidth: 12,
                                usePointStyle: true
                              }
                            },
                          },
                          scales: {
                            y: {
                              title: {
                                display: true,
                                text: 'Percent (%)'
                              }
                            }
                          }
                        }}
                        height={180}
                      />
                    </div>
                    <div className={styles.bestWorstDays}>
                      <div className={styles.bestDay}>
                        <span>Best: </span>September (+5.2%)
                      </div>
                      <div className={styles.worstDay}>
                        <span>Worst: </span>November (-2.1%)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Strategy Suggestions based on seasonality */}
              <div className={styles.strategySuggestions}>
                <h2>Strategic Insights</h2>
                <div className={styles.strategyCards}>
                  <div className={styles.strategyCard}>
                    <h3>Strongest Pattern</h3>
                    <p>September to December shows a consistent uptrend pattern over 3 years (+15.3% cumulative)</p>
                    <button className={styles.modernPrimaryButton}>Explore Strategy</button>
                  </div>
                  <div className={styles.strategyCard}>
                    <h3>Risk Pattern</h3>
                    <p>June historically shows consistent negative returns (-3.1% on average)</p>
                    <button className={styles.modernPrimaryButton}>Explore Strategy</button>
                  </div>
                  <div className={styles.strategyCard}>
                    <h3>AI Recommendation</h3>
                    <p>Consider stronger positions in March (+3.9%) and rebalancing in November (-2.1%)</p>
                    <button className={styles.modernPrimaryButton}>AI Analysis</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COT Report Tab */}
          {activeTab === 'cot' && (
            <div className={styles.cotTab}>
              <div className={styles.seasonalityHeader}>
                <h1>Commitment of Traders (COT) Report for {assetInfo.name}</h1>
                <p className={styles.seasonalityDescription}>
                  <FaInfoCircle className={styles.infoIcon} /> 
                  The COT report shows the positions of different types of traders in the futures markets. 
                  This analysis helps identify sentiment shifts among large institutional players, commercial hedgers, and retail traders.
                </p>
              </div>

              {/* Time Period Selection for COT data */}
              <div className={styles.periodSelectionBar}>
                <h2>Select Time Period</h2>
                <div className={styles.periodToggle}>
                  {['3M', '6M', '1Y', '2Y', '5Y'].map((period) => (
                    <button 
                      key={period}
                      className={`${styles.modernTabButton} ${period === '1Y' ? styles.activeTab : ''}`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main COT Chart */}
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h2>Net Positions by Trader Category</h2>
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
                  <Line 
                    data={{
                      labels: Array.from({ length: 52 }, (_, i) => `Week ${i+1}`),
                      datasets: [
                        {
                          label: 'Large Speculators',
                          data: Array.from({ length: 52 }, () => Math.floor(Math.random() * 200000) - 100000),
                          borderColor: 'rgb(75, 192, 192)',
                          tension: 0.3,
                          fill: false
                        },
                        {
                          label: 'Commercial Traders',
                          data: Array.from({ length: 52 }, () => Math.floor(Math.random() * 200000) - 100000),
                          borderColor: 'rgb(255, 99, 132)',
                          tension: 0.3,
                          fill: false
                        },
                        {
                          label: 'Small Speculators',
                          data: Array.from({ length: 52 }, () => Math.floor(Math.random() * 100000) - 50000),
                          borderColor: 'rgb(255, 205, 86)',
                          tension: 0.3,
                          fill: false
                        }
                      ]
                    }} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      elements: {
                        line: {
                          tension: 0.3
                        },
                        point: {
                          radius: 1,
                          hoverRadius: 5
                        }
                      },
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: 'Net Position (Contracts)',
                            font: {
                              size: 14,
                              weight: 'bold'
                            }
                          },
                          grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            maxTicksLimit: 12
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          align: 'end',
                          labels: {
                            boxWidth: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                          }
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
                </div>
                <div className={styles.chartSummary}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Current Price:</span>
                    <span className={styles.summaryValue}>$52,371.45</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Last Report Date:</span>
                    <span className={styles.summaryValue}>July 21, 2023</span>
                  </div>
                </div>
              </div>

              {/* Position Distribution */}
              <div className={styles.overviewSection}>
                <div className={styles.sectionHeader}>
                  <h2>Current Position Distribution</h2>
                  <button className={styles.modernIconButton} title="Learn About Position Distribution">
                    <FaInfoCircle />
                  </button>
                </div>
                <div className={styles.correlationMetrics}>
                  <div className={styles.compactCorrelationCard}>
                    <h3>Large Speculators</h3>
                    <div className={styles.correlationVisual}>
                      <div className={styles.smallDonutContainer}>
                        <Doughnut 
                          data={{
                            labels: ['Long', 'Short'],
                            datasets: [{
                              data: [67, 33],
                              backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                              borderWidth: 0,
                              cutout: '75%'
                            }]
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false }
                            }
                          }}
                          height={120}
                          width={120}
                        />
                        <div className={styles.correlationValueCompact}>67% Long</div>
                      </div>
                      <div className={styles.correlationDescription}>
                        <div className={styles.positionDetails}>
                          <div className={styles.positionDetail}>
                            <span>Net Position:</span>
                            <span className={styles.positiveValue}>+89,452 contracts</span>
                          </div>
                          <div className={styles.positionDetail}>
                            <span>Change:</span>
                            <span className={styles.positiveValue}>+12.5%</span>
                          </div>
                        </div>
                        <p>Large speculators maintain a bullish stance with significant net long positions.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.compactCorrelationCard}>
                    <h3>Commercial Traders</h3>
                    <div className={styles.correlationVisual}>
                      <div className={styles.smallDonutContainer}>
                        <Doughnut 
                          data={{
                            labels: ['Long', 'Short'],
                            datasets: [{
                              data: [42, 58],
                              backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                              borderWidth: 0,
                              cutout: '75%'
                            }]
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false }
                            }
                          }}
                          height={120}
                          width={120}
                        />
                        <div className={styles.correlationValueCompact}>42% Long</div>
                      </div>
                      <div className={styles.correlationDescription}>
                        <div className={styles.positionDetails}>
                          <div className={styles.positionDetail}>
                            <span>Net Position:</span>
                            <span className={styles.negativeValue}>-63,287 contracts</span>
                          </div>
                          <div className={styles.positionDetail}>
                            <span>Change:</span>
                            <span className={styles.negativeValue}>-8.7%</span>
                          </div>
                        </div>
                        <p>Commercial hedgers have increased short positions, often a sign of hedging against downside risk.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.compactCorrelationCard}>
                    <h3>Small Speculators</h3>
                    <div className={styles.correlationVisual}>
                      <div className={styles.smallDonutContainer}>
                        <Doughnut 
                          data={{
                            labels: ['Long', 'Short'],
                            datasets: [{
                              data: [51, 49],
                              backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                              borderWidth: 0,
                              cutout: '75%'
                            }]
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false }
                            }
                          }}
                          height={120}
                          width={120}
                        />
                        <div className={styles.correlationValueCompact}>51% Long</div>
                      </div>
                      <div className={styles.correlationDescription}>
                        <div className={styles.positionDetails}>
                          <div className={styles.positionDetail}>
                            <span>Net Position:</span>
                            <span className={styles.positiveValue}>+3,835 contracts</span>
                          </div>
                          <div className={styles.positionDetail}>
                            <span>Change:</span>
                            <span className={styles.positiveValue}>+2.1%</span>
                          </div>
                        </div>
                        <p>Retail traders show nearly balanced positions with a slight bias toward longs.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Analysis */}
              <div className={styles.overviewSection}>
                <div className={styles.sectionHeader}>
                  <h2>Historical Analysis</h2>
                </div>

                <div className={styles.historicalAnalysisGrid}>
                  <div className={styles.analysisCard}>
                    <div className={styles.cardHeader}>
                      <h3>Position Extremes</h3>
                      <div className={styles.cardActions}>
                        <button className={styles.modernIconButton}><FaDownload /></button>
                        <button className={styles.modernIconButton}><FaInfoCircle /></button>
                      </div>
                    </div>
                    <div className={styles.extremesTable}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th>Trader Type</th>
                            <th>Highest Net Long</th>
                            <th>Date / Price</th>
                            <th>Highest Net Short</th>
                            <th>Date / Price</th>
                            <th>Current Position</th>
                            <th>Trend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positionExtremesData.map((row, index) => (
                            <tr key={index}>
                              <td><strong>{row.traderType}</strong></td>
                              <td className={styles.positive}>{row.highestLong.value}</td>
                              <td>{row.highestLong.date} <br/><small>{row.highestLong.price}</small></td>
                              <td className={styles.negative}>{row.highestShort.value}</td>
                              <td>{row.highestShort.date} <br/><small>{row.highestShort.price}</small></td>
                              <td className={row.currentPosition.value.startsWith('+') ? styles.positive : styles.negative}>
                                {row.currentPosition.value}
                              </td>
                              <td>
                                {row.currentPosition.direction === 'increasing' && (
                                  <span className={styles.positive}>
                                    <span className={`${styles.trendIcon} ${styles.upTrend}`}><FaArrowUp /></span>
                                    {row.currentPosition.change}
                                  </span>
                                )}
                                {row.currentPosition.direction === 'decreasing' && (
                                  <span className={styles.negative}>
                                    <span className={`${styles.trendIcon} ${styles.downTrend}`}><FaArrowDown /></span>
                                    {row.currentPosition.change}
                                  </span>
                                )}
                                {row.currentPosition.direction === 'stable' && (
                                  <span className={styles.neutral}>
                                    <span className={`${styles.trendIcon} ${styles.neutralTrend}`}><FaExchangeAlt /></span>
                                    {row.currentPosition.change}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={styles.analysisCard}>
                    <div className={styles.cardHeader}>
                      <h3>Trading Activity</h3>
                      <div className={styles.cardActions}>
                        <button className={styles.modernIconButton}><FaEye /></button>
                        <button className={styles.modernIconButton}><FaInfoCircle /></button>
                      </div>
                    </div>
                    <div className={styles.compactBarChart}>
                      <Bar 
                        data={{
                          labels: ['Large Speculators', 'Commercial Traders', 'Small Speculators'],
                          datasets: [
                            {
                              label: 'Total Volume',
                              data: [372564, 598721, 124673],
                              backgroundColor: 'rgba(153, 102, 255, 0.7)',
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: 'y' as const,
                          plugins: {
                            legend: {
                              display: false
                            }
                          },
                          scales: {
                            x: {
                              title: {
                                display: true,
                                text: 'Contracts'
                              }
                            }
                          }
                        }}
                        height={150}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className={styles.overviewSection}>
                <div className={styles.sectionHeader}>
                  <h2>Sentiment Analysis</h2>
                  <button className={styles.modernIconButton} title="Latest Report: July 21, 2023">
                    <FaHistory />
                  </button>
                </div>

                <table className={styles.sentimentTable}>
                  <thead>
                    <tr>
                      <th>Trader Category</th>
                      <th>Sentiment</th>
                      <th>Net Position</th>
                      <th>Change</th>
                      <th>Long %</th>
                      <th>Analysis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentimentData.map((row, index) => (
                      <tr key={index}>
                        <td><strong>{row.traderCategory}</strong></td>
                        <td>
                          {row.sentiment === 'bullish' && (
                            <span className={`${styles.sentimentBadge} ${styles.bullishBadge}`}>
                              <FaArrowUp className={styles.badgeIcon} /> Bullish
                            </span>
                          )}
                          {row.sentiment === 'bearish' && (
                            <span className={`${styles.sentimentBadge} ${styles.bearishBadge}`}>
                              <FaArrowDown className={styles.badgeIcon} /> Bearish
                            </span>
                          )}
                          {row.sentiment === 'neutral' && (
                            <span className={`${styles.sentimentBadge} ${styles.neutralBadge}`}>
                              <FaExchangeAlt className={styles.badgeIcon} /> Neutral
                            </span>
                          )}
                        </td>
                        <td className={row.netPosition.startsWith('+') ? styles.positive : styles.negative}>
                          {row.netPosition}
                        </td>
                        <td className={row.change.startsWith('+') ? styles.positive : styles.negative}>
                          {row.change}
                        </td>
                        <td>{row.longPercentage}</td>
                        <td>{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Strategy Insights */}
              <div className={styles.strategySuggestions}>
                <h2>Trading Insights</h2>
                <div className={styles.strategyCards}>
                  <div className={styles.strategyCard}>
                    <h3>Contrarian Signal</h3>
                    <p>Commercial traders increasing short positions may indicate overextended price. Consider partial profit taking.</p>
                    <button className={styles.modernPrimaryButton}>Explore Strategy</button>
                  </div>
                  <div className={styles.strategyCard}>
                    <h3>Historical Pattern</h3>
                    <p>Current positioning ratio between large speculators and commercials matches Feb 2021 rally pattern.</p>
                    <button className={styles.modernPrimaryButton}>View Pattern</button>
                  </div>
                  <div className={styles.strategyCard}>
                    <h3>AI Recommendation</h3>
                    <p>Position divergence suggests near-term volatility. Consider options strategies to capitalize on price swings.</p>
                    <button className={styles.modernPrimaryButton}>AI Analysis</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
