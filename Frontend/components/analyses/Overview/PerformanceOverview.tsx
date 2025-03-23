import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';
import html2canvas from 'html2canvas';
import { FaDownload, FaExpand, FaQuestion, FaInfoCircle, FaCompress } from 'react-icons/fa';
import { fetchChartData, fetchQuoteData, ChartDataPoint } from '../../../services/api/finance';

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
    name: symbol, // Use symbol as initial name
    symbol: symbol || ''
  });
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [selectedInterval, setSelectedInterval] = useState('1d');
  const [dateRange, setDateRange] = useState<{startDate: Date, endDate: Date}>({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Default to 1 year ago
    endDate: new Date()
  });
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

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
    const loadChartData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Format dates for the API request
        const period1 = dateRange.startDate.toISOString();
        const period2 = dateRange.endDate.toISOString();
        
        // Get chart data from the API service
        const data = await fetchChartData(
          symbol,
          period1,
          period2,
          selectedInterval
        );
        
        setChartData(data);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError(`Failed to load chart data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (symbol) {
      loadChartData();
      
      // Also fetch quote data to get the asset name
      fetchQuoteData(symbol)
        .then(quote => {
          setAssetInfo({
            name: quote.longname || quote.shortname ||symbol,
            symbol: quote.symbol
          });
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
    
    // Set the period to 'custom' explicitly
    setSelectedPeriod('custom');
    
    // Close the date picker panel
    setShowCustomDateRange(false);
    
  };

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (chartContainerRef.current?.requestFullscreen) {
        chartContainerRef.current.requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => {
            setIsFullscreen(false);
          })
          .catch(err => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`);
          });
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Download chart as image
  const downloadChart = async () => {
    if (!chartRef.current) return;
    
    try {
      // Set loading indicator or cursor if needed
      document.body.style.cursor = 'wait';
      
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher scale for better quality
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${assetInfo.symbol}-chart-${formatDateForFilename(new Date())}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download chart:', error);
      alert('Failed to download chart. Please try again.');
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  // Format date for filename
  const formatDateForFilename = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.analysisCard}>
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

        {/* Custom Date Range Panel - Enhanced UI */}
        {showCustomDateRange && (
          <div className={styles.customDatePanel}>
            <form onSubmit={handleCustomDateSubmit}>
              <div className={styles.dateRangeHeader}>
                <h3>Select Custom Date Range</h3>
                <button 
                  type="button" 
                  className={styles.closeButton}
                  onClick={() => setShowCustomDateRange(false)}
                >
                  &times;
                </button>
              </div>
              
              <div className={styles.dateInputGroup}>
                <div className={styles.dateInputWrapper}>
                  <label>Start Date</label>
                  <div className={styles.dateInputContainer}>
                    <input 
                      type="date" 
                      value={dateRange.startDate.toISOString().substring(0, 10)}
                      onChange={(e) => setDateRange(prev => ({ 
                        ...prev, 
                        startDate: new Date(e.target.value) 
                      }))}
                      required
                      max={dateRange.endDate.toISOString().substring(0, 10)}
                      className={styles.dateInput}
                    />
                  </div>
                </div>
                
                <div className={styles.dateSeparator}>to</div>
                
                <div className={styles.dateInputWrapper}>
                  <label>End Date</label>
                  <div className={styles.dateInputContainer}>
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
                      className={styles.dateInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.dateRangeFeedback}>
                {dateRange.endDate.getTime() - dateRange.startDate.getTime() > 0 ? (
                  <span className={styles.validRange}>
                    {Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))} days selected
                  </span>
                ) : (
                  <span className={styles.invalidRange}>
                    End date must be after start date
                  </span>
                )}
              </div>
              
              <div className={styles.dateQuickOptions}>
                <button 
                  type="button" 
                  className={styles.quickOptionButton}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setMonth(end.getMonth() - 3);
                    setDateRange({ startDate: start, endDate: end });
                  }}
                >
                  Last 3 months
                </button>
                <button 
                  type="button" 
                  className={styles.quickOptionButton}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setFullYear(end.getFullYear() - 1);
                    setDateRange({ startDate: start, endDate: end });
                  }}
                >
                  Last year
                </button>
                <button 
                  type="button" 
                  className={styles.quickOptionButton}
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setFullYear(end.getFullYear() - 5);
                    setDateRange({ startDate: start, endDate: end });
                  }}
                >
                  Last 5 years
                </button>
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  type="submit" 
                  className={styles.applyButton}
                  disabled={dateRange.endDate.getTime() <= dateRange.startDate.getTime()}
                >
                  Apply Range
                </button>
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
        <div className={styles.chartCard} ref={chartContainerRef}>
          <div className={styles.chartHeader}>
            <h2>
              {selectedPeriod === 'custom' 
                ? `Custom Period (${formatDateForDisplay(dateRange.startDate)} - ${formatDateForDisplay(dateRange.endDate)}) ` 
                : selectedPeriod} 
              Price Trend for {assetInfo.symbol}
            </h2>
            <div className={styles.chartControls}>
              <button 
                className={styles.modernActionButton} 
                title="Download Chart"
                onClick={downloadChart}
              >
                <FaDownload className={styles.buttonIcon} /> 
                <span>Download</span>
              </button>
              <button 
                className={styles.modernActionButton} 
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <>
                    <FaCompress className={styles.buttonIcon} /> 
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <FaExpand className={styles.buttonIcon} /> 
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
              <button 
                className={styles.modernIconButton} 
                title="Learn More"
                onClick={() => setShowInfoModal(true)}
              >
                <FaQuestion />
              </button>
            </div>
          </div>
          <div 
            className={`${styles.trendChart} ${isFullscreen ? styles.fullscreenChart : ''}`}
            ref={chartRef}
          >
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
                          return  value;
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
                          
                          label.push(`Price: ${dataPoint.close.toFixed(2)}`);
                          
                          if (dataPoint.open !== undefined) {
                            label.push(`Open: ${dataPoint.open.toFixed(2)}`);
                          }
                          
                          if (dataPoint.high !== undefined && dataPoint.low !== undefined) {
                            label.push(`High: ${dataPoint.high.toFixed(2)}`);
                            label.push(`Low: ${dataPoint.low.toFixed(2)}`);
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
      </div>
      
      {/* Info Modal */}
      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>About Price Trends Chart</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowInfoModal(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <h4>How to use this chart:</h4>
              <ul className={styles.infoList}>
                <li>Select different time periods from the top menu (1M to 20Y)</li>
                <li>Choose intervals (Daily, Weekly, Monthly) to adjust the data granularity</li>
                <li>Hover over any point on the chart to see detailed price information</li>
                <li>Use the custom date range option for specific time periods</li>
                <li>Download the chart as an image using the download button</li>
                <li>View the chart in fullscreen for a larger display</li>
              </ul>
              
              <h4>Reading the data:</h4>
              <p>
                The chart displays the closing price of {assetInfo.symbol} over your selected time period. 
                Each data point represents the price at the end of the selected interval (day, week, or month).
              </p>
              <p>
                When you hover over a data point, you'll see additional information like the open, high, low, and 
                volume for that specific time period.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.applyButton}
                onClick={() => setShowInfoModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceOverview;
