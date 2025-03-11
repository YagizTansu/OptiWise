import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { FaDownload, FaExpand, FaQuestion, FaInfoCircle } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';

interface ChartDataPoint {
  timestamp: number;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  date?: string;
  fullDate?: Date;
}

// Performance periods data
const performancePeriods = [
  { label: '1M',  months: 1 },
  { label: '3M',  months: 3 },
  { label: '6M',  months: 6 },
  { label: '1Y',  months: 12 },
  { label: '3Y',  months: 36 },
  { label: '5Y',  months: 60 },
  { label: '10Y', months: 120 },
  { label: '20Y', months: 240 },
];

// Available intervals to select
const availableIntervals = [
  { label: 'Daily', value: '1d' },
  { label: '5 Day', value: '5d' },
  { label: 'Weekly', value: '1wk' },
  { label: 'Monthly', value: '1mo' }
];

interface PerformanceOverviewProps {
  symbol: string;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ symbol }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assetInfo, setAssetInfo] = useState<{ name: string; symbol: string }>({ 
    name: 'Loading...', 
    symbol: symbol || ''
  });
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [selectedInterval, setSelectedInterval] = useState('1d');
  const [dateRange, setDateRange] = useState<{startDate: Date, endDate: Date}>({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Default to 1 year ago
    endDate: new Date()
  });
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);

  // Make selectedPeriod available to other components if needed
  useEffect(() => {
    // Could publish selectedPeriod to a state management solution or event system
    document.dispatchEvent(new CustomEvent('periodChange', { detail: selectedPeriod }));
  }, [selectedPeriod]);

  // Update date range when period changes
  useEffect(() => {
    if (selectedPeriod !== 'custom') {
      const selectedPeriodObj = performancePeriods.find(p => p.label === selectedPeriod);
      const monthsToShow = selectedPeriodObj ? selectedPeriodObj.months : 12; // Default to 1 year
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - monthsToShow);
      
      setDateRange({ startDate, endDate });
    }
  }, [selectedPeriod]);

  // Fetch chart data based on the symbol, date range, and interval
  useEffect(() => {
    const fetchChartData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Format dates for the API request
        const period1 = dateRange.startDate.toISOString();
        const period2 = dateRange.endDate.toISOString();
        
        console.log('Fetching chart data with params:', {
          symbol,
          period1,
          period2,
          interval: selectedInterval
        });
        
        // Make API call with all required parameters
        const response = await axios.get('http://localhost:3001/api/finance/chart', {
          params: {
            symbol,
            period1,
            period2,
            interval: selectedInterval,
            includePrePost: true,
            events: 'div|split|earn',
            lang: 'en-US',
            return: 'array',
            useYfid: true
          }
        });
        
        console.log('API Response:', response.data);
        
        // Handle the direct meta/quotes format that the API is returning
        if (response.data && response.data.meta && response.data.quotes && Array.isArray(response.data.quotes)) {
          const { meta, quotes } = response.data;
          
          // Update asset info
          setAssetInfo({
            name: meta.symbol || symbol,
            symbol: meta.symbol || symbol
          });
          
          if (quotes.length === 0) {
            setError('No data available for the selected period and interval');
            setIsLoading(false);
            return;
          }
          
          // Format data for chart - with proper date processing for display
          const formattedData = quotes
            .map((quote: any) => {
              // Check for essential data
              if (quote.close === null || quote.close === undefined) {
                return null;
              }
              
              // Handle timestamp which might be provided in different formats
              const timestamp = quote.timestamp || quote.date || quote.time;
              if (!timestamp) {
                return null;
              }
              
              // Convert timestamp to Date object
              const fullDate = typeof timestamp === 'number' 
                ? new Date(timestamp * 1000)  // Unix timestamp in seconds 
                : new Date(timestamp);        // ISO string or other date format
              
              const dateStr = fullDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              return {
                timestamp: typeof timestamp === 'number' ? timestamp : fullDate.getTime() / 1000,
                close: quote.close,
                open: quote.open,
                high: quote.high,
                low: quote.low,
                volume: quote.volume,
                date: dateStr,
                fullDate
              };
            })
            .filter((point: any) => point !== null);
          
          console.log(`Processed ${formattedData.length} valid data points`);
          
          if (formattedData.length === 0) {
            setError('No valid data points received for the selected range and interval');
          } else {
            setChartData(formattedData);
          }
        } 
        // Try to handle the Yahoo Finance API format as a fallback
        else if (response.data && response.data.chart && response.data.chart.result && 
            response.data.chart.result[0] && response.data.chart.result[0].indicators) {
          // ...existing code for handling the original format...
          const result = response.data.chart.result[0];
          const timestamps = result.timestamp || [];
          const quotes = result.indicators.quote && result.indicators.quote.length > 0 ? 
                         result.indicators.quote[0] : {};
          const meta = result.meta || {};
          
          if (!timestamps || !timestamps.length || !quotes || !quotes.close) {
            console.error('Invalid data structure in API response:', { timestamps, quotes });
            setError('The API returned an invalid data structure');
            setIsLoading(false);
            return;
          }
          
          // Update asset info
          setAssetInfo({
            name: meta.symbol || symbol,
            symbol: meta.symbol || symbol
          });
          
          // Format data for chart - with proper date processing for display and filter out invalid points
          const formattedData = timestamps
            .map((timestamp: number, index: number) => {
              if (quotes.close[index] === null || quotes.close[index] === undefined) {
                return null;
              }
              
              const fullDate = new Date(timestamp * 1000);
              const dateStr = fullDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              return {
                timestamp,
                close: quotes.close[index],
                open: quotes.open ? quotes.open[index] : undefined,
                high: quotes.high ? quotes.high[index] : undefined,
                low: quotes.low ? quotes.low[index] : undefined,
                volume: quotes.volume ? quotes.volume[index] : undefined,
                date: dateStr,
                fullDate
              };
            })
            .filter((point: any) => point !== null);
          
          console.log(`Processed ${formattedData.length} valid data points`);
          
          if (formattedData.length === 0) {
            setError('No valid data points received for the selected range and interval');
          } else {
            setChartData(formattedData);
          }
        } else {
          console.error('Unrecognized response format:', response.data);
          setError('The API returned an unrecognized data format');
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(`Failed to load chart data: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
  }, [symbol, dateRange, selectedInterval]);

  // Create chart data from API response
  const realTrendData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      console.log('No chart data available to render');
      return null;
    }
    
    const labels = chartData.map(point => point.date);
    const data = chartData.map(point => point.close);
    
    console.log(`Creating chart with ${labels.length} data points`);
    
    // Create a basic dataset if data is available
    return {
      labels: labels,
      datasets: [{
        label: 'Price ($)',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.2,
        fill: true,
        pointRadius: chartData.length > 100 ? 0 : 2,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgb(75, 192, 192)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      }]
    };
  }, [chartData]);

  // Handle period selection
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (period === 'custom') {
      setShowCustomDateRange(true);
    } else {
      setShowCustomDateRange(false);
    }
  };

  // Handle custom date range submission
  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure there's at least one day difference between dates
    const timeDiff = dateRange.endDate.getTime() - dateRange.startDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    if (daysDiff < 1) {
      alert('Please select a date range of at least one day');
      return;
    }
    
    setShowCustomDateRange(false);
  };

  // Determine the appropriate label for X-axis based on selected interval
  const getDateFormat = () => {
    switch(selectedInterval) {
      case '1m':
      case '2m':
      case '5m':
      case '15m':
      case '30m':
      case '60m':
      case '90m':
      case '1h':
        return { day: 'numeric', hour: 'numeric', minute: 'numeric' };
      case '1d':
      case '5d':
        return { month: 'short', day: 'numeric' };
      case '1wk':
      case '1mo':
      case '3mo':
        return { year: 'numeric', month: 'short' };
      default:
        return { year: 'numeric', month: 'short', day: 'numeric' };
    }
  };

  return (
    <>
      {/* Overview Header Section */}
      <div className={styles.seasonalityHeader}>
        <h1>Performance Overview for {assetInfo.name}</h1>
        <p className={styles.seasonalityDescription}>
          <FaInfoCircle className={styles.infoIcon} /> 
          Track historical performance trends and compare returns across different timeframes to make 
          informed investment decisions.
        </p>
      </div>

      {/* Time Period & Interval Selection */}
      <div className={styles.periodSelectionBar}>
        <div className={styles.selectionGroup}>
          <h2>Time Period</h2>
          <div className={styles.periodToggle}>
            {performancePeriods.map((period) => (
              <button 
                key={period.label}
                className={`${styles.modernTabButton} ${selectedPeriod === period.label ? styles.activeTab : ''}`}
                onClick={() => handlePeriodChange(period.label)}
              >
                {period.label}
              </button>
            ))}
            <button 
              className={`${styles.modernTabButton} ${selectedPeriod === 'custom' ? styles.activeTab : ''}`}
              onClick={() => handlePeriodChange('custom')}
            >
              Custom
            </button>
          </div>
        </div>
        
        <div className={styles.selectionGroup}>
          <h2>Interval</h2>
          <div className={styles.periodToggle}>
            {availableIntervals.map((interval) => (
              <button 
                key={interval.value}
                className={`${styles.modernTabButton} ${selectedInterval === interval.value ? styles.activeTab : ''}`}
                onClick={() => setSelectedInterval(interval.value)}
              >
                {interval.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Range Panel */}
      {showCustomDateRange && (
        <div className={styles.customDatePanel}>
          <form onSubmit={handleCustomDateSubmit}>
            <div className={styles.dateInputGroup}>
              <label>
                Start Date:
                <input 
                  type="date" 
                  value={dateRange.startDate.toISOString().substring(0, 10)}
                  onChange={(e) => setDateRange(prev => ({ 
                    ...prev, 
                    startDate: new Date(e.target.value) 
                  }))}
                  required
                />
              </label>
              <label>
                End Date:
                <input 
                  type="date" 
                  value={dateRange.endDate.toISOString().substring(0, 10)}
                  onChange={(e) => setDateRange(prev => ({ 
                    ...prev, 
                    endDate: new Date(e.target.value) 
                  }))}
                  required
                  min={dateRange.startDate.toISOString().substring(0, 10)}
                  max={new Date().toISOString().substring(0, 10)}
                />
              </label>
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.applyButton}>Apply Range</button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => setShowCustomDateRange(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Trend Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>{selectedPeriod === 'custom' ? 'Custom Period' : selectedPeriod} Price Trend for {assetInfo.symbol}</h2>
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
              <button 
                className={styles.retryButton} 
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (!chartData || chartData.length === 0) ? (
            <div className={styles.noDataContainer}>
              <p>No data available for the selected time period and interval.</p>
              <p>Try adjusting your selection or check if the symbol has data for this range.</p>
              <div className={styles.noDataSuggestions}>
                <p>Suggestions:</p>
                <ul>
                  <li>Use daily interval (1d) for longer time periods</li>
                  <li>Use minute intervals (15m, 30m, 1h) only for recent data (less than 7 days)</li>
                  <li>Check that the symbol is valid and has historical data</li>
                  <li>Some exchanges may have limited historical data</li>
                </ul>
                <button 
                  className={styles.suggestedPeriodButton}
                  onClick={() => {
                    setSelectedPeriod('1Y');
                    setSelectedInterval('1d');
                  }}
                >
                  Try 1 Year Daily Data
                </button>
              </div>
            </div>
          ) : (
            <Line 
              data={realTrendData!}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                elements: {
                  line: {
                    tension: 0.2
                  },
                  point: {
                    radius: chartData.length > 100 ? 0 : 2,
                    hoverRadius: 5
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: 'rgba(200, 200, 200, 0.1)'
                    },
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      maxTicksLimit: Math.min(12, chartData.length),
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
                    },
                    callbacks: {
                      title: function(tooltipItems) {
                        return chartData[tooltipItems[0].dataIndex].date;
                      },
                      label: function(context) {
                        const dataPoint = chartData[context.dataIndex];
                        let label = [];
                        
                        label.push(`Price: $${dataPoint.close.toFixed(2)}`);
                        
                        if (dataPoint.open !== undefined) {
                          label.push(`Open: $${dataPoint.open.toFixed(2)}`);
                        }
                        
                        if (dataPoint.high !== undefined && dataPoint.low !== undefined) {
                          label.push(`High: $${dataPoint.high.toFixed(2)}`);
                          label.push(`Low: $${dataPoint.low.toFixed(2)}`);
                        }
                        
                        if (dataPoint.volume !== undefined) {
                          label.push(`Volume: ${new Intl.NumberFormat().format(dataPoint.volume)}`);
                        }
                        
                        return label;
                      }
                    }
                  }
                }
              }}
              height={400}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PerformanceOverview;
