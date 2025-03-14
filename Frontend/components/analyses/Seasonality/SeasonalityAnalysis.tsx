import { FaChartLine, FaCircle, FaDownload, FaExpand, FaQuestion, FaInfoCircle, FaCompress } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';
import html2canvas from 'html2canvas';

// Define types for our data
interface SeasonalityDataPoint {
  period: string;
  avgChange: number;
}

interface SeasonalityDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor: string;
}

interface SeasonalityChartData {
  labels: string[];
  datasets: SeasonalityDataset[];
}

interface SeasonalityAnalysisProps {
  symbol: string;
}

const SeasonalityAnalysis: React.FC<SeasonalityAnalysisProps> = ({ symbol }) => {
  // Internal state management - moved from parent
  const [comparisonPeriods, setComparisonPeriods] = useState({ first: '3 Years', second: '5 Years' });
  const [activeTimeframe, setActiveTimeframe] = useState('monthly');
  const [showDataPoints, setShowDataPoints] = useState(true);
  const [viewMode, setViewMode] = useState('line');

  // State for data loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add new state variables for fullscreen and info modal
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for API data
  const [seasonalityData, setSeasonalityData] = useState<{
    monthly: SeasonalityChartData | null;
    daily: SeasonalityChartData | null;
    weekly: SeasonalityChartData | null;
    yearly: SeasonalityChartData | null;
  }>({
    monthly: null,
    daily: null,
    weekly: null,
    yearly: null
  });

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

  // Parse period string to get number of years
  const getPeriodYears = (period: string): number => {
    return parseInt(period.split(' ')[0]);
  };

  // Calculate daily seasonality (average % change by day of month)
  const calculateDailySeasonality = (historicalData: any[], periodYears: number): SeasonalityDataPoint[] => {
    // Initialize data structure for all days (1-31)
    const dayData: { [key: number]: { sum: number, count: number } } = {};
    for (let i = 1; i <= 31; i++) {
      dayData[i] = { sum: 0, count: 0 };
    }
    
    // Process each data point
    for (let i = 1; i < historicalData.length; i++) {
      const current = historicalData[i];
      const previous = historicalData[i - 1];
      
      // Skip if data is incomplete
      if (!current || !previous || !current.close || !previous.close) continue;
      
      const date = new Date(current.date);
      const dayOfMonth = date.getDate();
      
      // Calculate percent change
      const percentChange = ((current.close - previous.close) / previous.close) * 100;
      
      // Add to running total
      dayData[dayOfMonth].sum += percentChange;
      dayData[dayOfMonth].count += 1;
    }
    
    // Calculate averages and format data
    return Array.from({length: 31}, (_, i) => {
      const day = i + 1;
      const avgChange = dayData[day].count > 0 ? dayData[day].sum / dayData[day].count : 0;
      return {
        period: day.toString(),
        avgChange: Number(avgChange.toFixed(2))
      };
    });
  };

  // Calculate weekly seasonality (average % change by day of week)
  const calculateWeeklySeasonality = (historicalData: any[], periodYears: number): SeasonalityDataPoint[] => {
    const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weekdayData: { [key: number]: { sum: number, count: number } } = {};
    
    for (let i = 0; i < 5; i++) {
      weekdayData[i] = { sum: 0, count: 0 };
    }
    
    // Process each data point
    for (let i = 1; i < historicalData.length; i++) {
      const current = historicalData[i];
      const previous = historicalData[i - 1];
      
      if (!current || !previous || !current.close || !previous.close) continue;
      
      const date = new Date(current.date);
      // JavaScript getDay() returns 0-6 where 0 is Sunday and 6 is Saturday
      // We adjust to 0 = Monday, 4 = Friday
      const dayOfWeek = date.getDay();
      // Convert Sunday(0) to Monday(0) through Saturday(6) to Friday(4)
      const adjustedDay = dayOfWeek === 0 ? -1 : dayOfWeek - 1;
      
      // Skip weekends
      if (adjustedDay < 0 || adjustedDay > 4) continue;
      
      const percentChange = ((current.close - previous.close) / previous.close) * 100;
      
      weekdayData[adjustedDay].sum += percentChange;
      weekdayData[adjustedDay].count += 1;
    }
    
    return weekdayNames.map((day, index) => {
      const avgChange = weekdayData[index].count > 0 ? 
        weekdayData[index].sum / weekdayData[index].count : 0;
      return {
        period: day,
        avgChange: Number(avgChange.toFixed(2))
      };
    });
  };

  // Calculate monthly seasonality (average % change by month)
  const calculateMonthlySeasonality = (historicalData: any[], periodYears: number): SeasonalityDataPoint[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyReturns: { [key: number]: number[] } = {};
    
    // Initialize the monthly returns array
    for (let i = 0; i < 12; i++) {
      monthlyReturns[i] = [];
    }
    
    // Group data by year-month to calculate monthly returns
    const monthlyData: { [key: string]: { open?: number, close?: number } } = {};
    
    historicalData.forEach(dataPoint => {
      if (!dataPoint || !dataPoint.close) return;
      
      const date = new Date(dataPoint.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const yearMonthKey = `${year}-${month}`;
      
      if (!monthlyData[yearMonthKey]) {
        // First entry for this month - set open price
        monthlyData[yearMonthKey] = {
          open: dataPoint.close
        };
      }
      // Always update close price (it will be the last one for the month)
      monthlyData[yearMonthKey].close = dataPoint.close;
    });
    
    // Calculate monthly returns
    Object.keys(monthlyData).forEach(yearMonthKey => {
      const [year, month] = yearMonthKey.split('-').map(Number);
      const data = monthlyData[yearMonthKey];
      
      if (data.open && data.close) {
        const monthlyReturn = ((data.close - data.open) / data.open) * 100;
        monthlyReturns[month].push(monthlyReturn);
      }
    });
    
    // Calculate average returns for each month
    return monthNames.map((name, month) => {
      const returns = monthlyReturns[month];
      const avgChange = returns.length > 0 
        ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
        : 0;
        
      return {
        period: name,
        avgChange: Number(avgChange.toFixed(2))
      };
    });
  };

  // Calculate yearly seasonality (average % change by year)
  const calculateYearlySeasonality = (historicalData: any[], periodYears: number): SeasonalityDataPoint[] => {
    if (historicalData.length === 0) return [];
    
    // Group data by year
    const yearlyData: { [key: number]: { firstDate?: string, firstPrice?: number, lastDate?: string, lastPrice?: number } } = {};
    
    // Sort data by date to ensure chronological order
    const sortedData = [...historicalData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Process data by year
    sortedData.forEach(dataPoint => {
      if (!dataPoint || !dataPoint.close) return;
      
      const date = new Date(dataPoint.date);
      const year = date.getFullYear();
      
      if (!yearlyData[year]) {
        yearlyData[year] = {
          firstDate: dataPoint.date,
          firstPrice: dataPoint.close,
          lastDate: dataPoint.date,
          lastPrice: dataPoint.close
        };
      } else {
        // Update last price (most recent for the year)
        yearlyData[year].lastDate = dataPoint.date;
        yearlyData[year].lastPrice = dataPoint.close;
      }
    });
    
    // Calculate yearly returns
    return Object.keys(yearlyData)
      .map(year => {
        const yearNum = parseInt(year);
        const { firstPrice, lastPrice } = yearlyData[yearNum];
        
        // Skip years with incomplete data
        if (firstPrice === undefined || lastPrice === undefined) {
          return {
            period: year,
            avgChange: 0
          };
        }
        
        const yearlyReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
        return {
          period: year,
          avgChange: Number(yearlyReturn.toFixed(2))
        };
      })
      .filter(item => item.avgChange !== 0); // Remove years with no data
  };

  // Fetch data for a specific timeframe and period
  const fetchSeasonalityData = async (timeframe: string, period: string) => {
    try {
      const periodYears = getPeriodYears(period);
      setIsLoading(true);
      
      // Calculate date range based on period (in years)
      const to = new Date();
      const from = new Date();
      from.setFullYear(from.getFullYear() - periodYears);
      
      // Determine appropriate interval based on timeframe
      let interval = '1d';
      if (timeframe === 'yearly') {
        interval = '1mo'; // Monthly data for yearly analysis is sufficient
      } else if (timeframe === 'monthly') {
        interval = '1d'; // Need daily data to properly calculate monthly performance
      } else if (timeframe === 'weekly') {
        interval = '1d'; // Need daily data to calculate day of week performance
      }
      
      // Fetch data from API using port 3001 explicitly
      const response = await axios.get('http://localhost:3001/api/finance/historical', {
        params: {
          symbol,
          from: from.toISOString().split('T')[0], // Format as YYYY-MM-DD
          to: to.toISOString().split('T')[0],
          interval
        }
      });
      
      // Process data based on timeframe
      let processedData: SeasonalityDataPoint[] = [];
      
      switch (timeframe) {
        case 'daily':
          processedData = calculateDailySeasonality(response.data, periodYears);
          break;
        case 'weekly':
          processedData = calculateWeeklySeasonality(response.data, periodYears);
          break;
        case 'monthly':
          processedData = calculateMonthlySeasonality(response.data, periodYears);
          break;
        case 'yearly':
          processedData = calculateYearlySeasonality(response.data, periodYears);
          break;
      }
      
      // Update the chart data
      const labels = processedData.map(item => item.period);
      const data = processedData.map(item => item.avgChange);
      
      // Determine colors based on whether this is primary or comparison period
      // Primary period is always blue, comparison is always orange
      const isPrimaryPeriod = period === comparisonPeriods.first;
      
      const color = isPrimaryPeriod 
        ? 'rgba(53, 162, 235, 0.7)'  // Blue for primary period
        : 'rgba(255, 159, 64, 0.7)'; // Orange for comparison period
      
      const borderColor = isPrimaryPeriod
        ? 'rgb(53, 162, 235)'  // Solid blue for primary period
        : 'rgb(255, 159, 64)'; // Solid orange for comparison period
      
      // Update the specific dataset
      setSeasonalityData(prevData => {
        // Initialize if null
        const currentData = prevData[timeframe as keyof typeof prevData] || {
          labels: labels,
          datasets: []
        };
        
        // Find existing dataset or create new one
        const datasetIndex = currentData.datasets.findIndex(ds => ds.label === period);
        
        if (datasetIndex >= 0) {
          // Update existing dataset
          const updatedDatasets = [...currentData.datasets];
          updatedDatasets[datasetIndex] = {
            ...updatedDatasets[datasetIndex],
            data,
            borderColor,
            backgroundColor: color
          };
          
          return {
            ...prevData,
            [timeframe]: {
              labels,
              datasets: updatedDatasets
            }
          };
        } else {
          // Create new dataset
          return {
            ...prevData,
            [timeframe]: {
              labels,
              datasets: [
                ...currentData.datasets,
                {
                  label: period,
                  data,
                  borderColor,
                  backgroundColor: color
                }
              ]
            }
          };
        }
      });
      
    } catch (err) {
      console.error(`Error fetching ${timeframe} seasonality data for ${period}:`, err);
      setError(`Failed to fetch ${timeframe} data for ${period}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all data when component mounts or when parameters change
  useEffect(() => {
    // Reset error state
    setError(null);
    
    // Clear existing chart data when periods change to ensure we don't keep old datasets
    setSeasonalityData(prevData => {
      // Keep data structure but clear all datasets
      if (prevData[activeTimeframe as keyof typeof prevData]) {
        return {
          ...prevData,
          [activeTimeframe]: {
            labels: prevData[activeTimeframe as keyof typeof prevData]?.labels || [],
            datasets: [] // Clear all datasets, we'll refetch them
          }
        };
      }
      return prevData;
    });
    
    // Fetch data for both comparison periods
    const loadAllData = async () => {
      Promise.all([
        fetchSeasonalityData(activeTimeframe, comparisonPeriods.first),
        fetchSeasonalityData(activeTimeframe, comparisonPeriods.second)
      ]);
    };
    
    loadAllData();
  }, [activeTimeframe, comparisonPeriods.first, comparisonPeriods.second, symbol]);

  // Function to get the current seasonality data based on the timeframe
  const getCurrentSeasonalityData = () => {
    const data = seasonalityData[activeTimeframe as keyof typeof seasonalityData];
    
    if (!data || data.datasets.length === 0) {
      // Return empty data structure while loading
      return {
        labels: [],
        datasets: []
      };
    }
    
    return data;
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
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
      link.download = `${symbol}-seasonality-${activeTimeframe}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download chart:', error);
      alert('Failed to download chart. Please try again.');
    } finally {
      document.body.style.cursor = 'default';
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

  return (
    <div className={styles.cardContainer}>
      <div className={styles.analysisCard} ref={containerRef}>
        {/* Header Section */}
        <div className={styles.seasonalityHeader}>
          <h2>Seasonality Analysis for {symbol}</h2>
          <p className={styles.seasonalityDescription}>
            <FaInfoCircle className={styles.infoIcon} /> 
            Analyze how the asset performs during different time periods to identify recurring patterns and seasonal trends.
          </p>
        </div>
        
        {/* Chart Controls */}
        <div className={styles.chartHeader}>
          <h3>{getChartTitle()} Comparison</h3>
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
        
        {/* Settings Controls */}
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
                <option value="7 Years">7 Years</option>
                <option value="10 Years">10 Years</option>
                <option value="15 Years">15 Years</option>
                <option value="20 Years">20 Years</option>
                <option value="25 Years">25 Years</option>
                <option value="30 Years">30 Years</option>
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
                <option value="7 Years">7 Years</option>
                <option value="10 Years">10 Years</option>
                <option value="15 Years">15 Years</option>
                <option value="20 Years">20 Years</option>
                <option value="25 Years">25 Years</option>
                <option value="30 Years">30 Years</option>
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

        {/* Chart */}
        <div 
          className={`${styles.comparisonChart} ${isFullscreen ? styles.fullscreenChart : ''}`}
          ref={chartRef}
        >
          {isLoading && <div className={styles.loadingOverlay}>Loading seasonality data...</div>}
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          {!isLoading && !error && viewMode === 'line' ? (
            <Line 
              data={getCurrentSeasonalityData()}
              options={seasonalityChartOptions}
              height={300}
            />
          ) : !isLoading && !error && (
            <Bar
              data={getCurrentSeasonalityData()}
              options={seasonalityChartOptions}
              height={300}
            />
          )}
        </div>
        
        {/* Info Modal */}
        {showInfoModal && (
          <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowInfoModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <h4>Understanding Seasonality:</h4>

                <ul className={styles.infoList}>
                  <li><strong>Daily:</strong> Performance trends by day of month</li>
                  <li><strong>Weekly:</strong> Performance by day of the week (Mon-Fri)</li>
                  <li><strong>Monthly:</strong> Performance patterns across months of the year</li>
                  <li><strong>Yearly:</strong> Year-to-year performance comparison</li>
                </ul>
                
                <h4>How to use this chart:</h4>
                <ul className={styles.infoList}>
                  <li>Select different time periods to compare historical performance patterns</li>
                  <li>Toggle between line and bar chart views for different visualizations</li>
                  <li>Show or hide data points for clearer reading</li>
                  <li>Download the chart as an image using the download button</li>
                </ul>
                
                <p>
                  Seasonal patterns can help inform trading and investment decisions, particularly for assets 
                  that show consistent performance during specific periods.
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
    </div>
  );
};

export default SeasonalityAnalysis;
