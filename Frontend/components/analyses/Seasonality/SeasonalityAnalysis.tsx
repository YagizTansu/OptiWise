import { FaChartLine, FaCircle, FaDownload, FaExpand, FaQuestion, FaInfoCircle, FaCompress } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import { useState, useEffect, useRef } from 'react';
import styles from '../../../styles/Analyses.module.css';
import html2canvas from 'html2canvas';
import { 
  fetchSeasonalityData, 
  SeasonalityChartData,
  fetchAllSeasonalityData
} from '../../../services/api/finance';
// Import required Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

  // Enhanced chart options with better styling and responsiveness
  const seasonalityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: showDataPoints ? 4 : 0,
        hoverRadius: showDataPoints ? 6 : 0,
        backgroundColor: (ctx: any) => {
          const dataset = ctx.chart.data.datasets[ctx.datasetIndex];
          return dataset.borderColor;
        },
        borderWidth: 2,
        borderColor: '#fff'
      },
      line: {
        borderWidth: 2,
        tension: 0.3
      },
      bar: {
        borderWidth: 1,
        borderRadius: 4
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        },
        ticks: {
          callback: (value: number) => `${value.toFixed(1)}%`,
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: 'Percent Change (%)',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        },
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 700
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 4,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}%`;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    hover: {
      mode: 'index' as const,
      intersect: false
    }
  };

  // Parse period string to get number of years
  const getPeriodYears = (period: string): number => {
    return parseInt(period.split(' ')[0]);
  };

  // Load data when component mounts or when parameters change
  useEffect(() => {
    // Reset error state
    setError(null);
    setIsLoading(true);
    
    const loadData = async () => {
      try {
        // Create periods with years
        const primaryPeriod = { 
          label: comparisonPeriods.first, 
          years: getPeriodYears(comparisonPeriods.first) 
        };
        
        const comparisonPeriod = { 
          label: comparisonPeriods.second, 
          years: getPeriodYears(comparisonPeriods.second) 
        };
        
        // Fetch all timeframes in the background to prevent loading states when switching tabs
        const allData = await fetchAllSeasonalityData(
          symbol,
          primaryPeriod,
          comparisonPeriod
        );
        
        // Update state with all timeframe data
        setSeasonalityData({
          daily: allData.daily || null,
          weekly: allData.weekly || null, 
          monthly: allData.monthly || null,
          yearly: allData.yearly || null
        });
        
        if (allData.error) {
          setError(allData.error);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error(`Error loading seasonality data:`, err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [comparisonPeriods.first, comparisonPeriods.second, symbol]);

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
    
    // Apply enhanced dataset styling
    const enhancedData = {
      labels: data.labels,
      datasets: data.datasets.map((dataset, index) => {
        const isPrimary = index === 0;
        // Primary dataset gets a blue color scheme, secondary gets orange
        const color = isPrimary 
          ? 'rgba(53, 162, 235, 0.7)'
          : 'rgba(255, 159, 64, 0.7)';
        
        const borderColor = isPrimary
          ? 'rgb(53, 162, 235)'
          : 'rgb(255, 159, 64)';
          
        // Enhanced dataset styling
        return {
          ...dataset,
          borderColor,
          backgroundColor: viewMode === 'line' ? 'rgba(0, 0, 0, 0.1)' : color,
          fill: viewMode === 'line' ? false : undefined,
          pointBackgroundColor: borderColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointHoverBackgroundColor: borderColor,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          pointHoverRadius: 6,
          barPercentage: 0.8,
          categoryPercentage: 0.7
        };
      })
    };
    
    return enhancedData;
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

  // Download chart as image with improved quality
  const downloadChart = async () => {
    if (!chartRef.current) return;
    
    try {
      // Set loading indicator or cursor if needed
      document.body.style.cursor = 'wait';
      
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false
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

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className={styles.loadingSpinner}>
      <div className={styles.spinner}></div>
      <p>Loading seasonality data...</p>
    </div>
  );

  // No data placeholder
  const NoDataPlaceholder = () => (
    <div className={styles.noDataPlaceholder}>
      <div className={styles.noDataIcon}>📊</div>
      <h3>No seasonality data available</h3>
      <p>Try selecting a different timeframe or period</p>
    </div>
  );

  // Helper to check if we have valid data to display
  const hasValidData = () => {
    const data = seasonalityData[activeTimeframe as keyof typeof seasonalityData];
    return data && data.labels && data.labels.length > 0 && 
           data.datasets && data.datasets.length > 0 && 
           data.datasets[0].data && data.datasets[0].data.length > 0;
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
              disabled={isLoading || !hasValidData()}
            >
              <FaDownload className={styles.buttonIcon} /> 
              <span>Download</span>
            </button>
            <button 
              className={styles.modernActionButton} 
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
              disabled={isLoading || !hasValidData()}
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
              disabled={isLoading}
            >
              <FaChartLine className={styles.buttonIcon} /> 
              <span>Line</span>
            </button>
            <button 
              className={`${styles.modernButton} ${viewMode === 'bar' ? styles.activeMod : ''}`}
              title="Bar Chart View"
              onClick={() => setViewMode('bar')}
              disabled={isLoading}
            >
              <FaChartLine className={styles.buttonIcon} /> 
              <span>Bar</span>
            </button>
            <button 
              className={`${styles.modernButton} ${showDataPoints ? styles.activeMod : ''}`}
              title="Toggle Data Points"
              onClick={() => setShowDataPoints(!showDataPoints)}
              disabled={isLoading || viewMode !== 'line'}
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
                disabled={isLoading}
              >
                <option value="1 Year">1 Year</option>
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
                disabled={isLoading}
              >
                <option value="1 Year">1 Year</option>
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
              disabled={isLoading}
            >
              <span>Daily</span>
            </button>
            <button 
              className={`${styles.modernTabButton} ${activeTimeframe === 'weekly' ? styles.activeTab : ''}`}
              title="Weekly View"
              onClick={() => setActiveTimeframe('weekly')}
              disabled={isLoading}
            >
              <span>Weekly</span>
            </button>
            <button 
              className={`${styles.modernTabButton} ${activeTimeframe === 'monthly' ? styles.activeTab : ''}`}
              title="Monthly View"
              onClick={() => setActiveTimeframe('monthly')}
              disabled={isLoading}
            >
              <span>Monthly</span>
            </button>
            <button 
              className={`${styles.modernTabButton} ${activeTimeframe === 'yearly' ? styles.activeTab : ''}`}
              title="Yearly View"
              onClick={() => setActiveTimeframe('yearly')}
              disabled={isLoading}
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
          {isLoading && <LoadingSpinner />}
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          {!isLoading && !error && !hasValidData() && <NoDataPlaceholder />}
          
          {!isLoading && !error && hasValidData() && (
            <div className={styles.chartContainer}>
              {viewMode === 'line' ? (
                <Line 
                  data={getCurrentSeasonalityData()}
                  options={seasonalityChartOptions}
                  height={isFullscreen ? 600 : 300}
                />
              ) : (
                <Bar
                  data={getCurrentSeasonalityData()}
                  options={seasonalityChartOptions}
                  height={isFullscreen ? 600 : 300}
                />
              )}
            </div>
          )}
        </div>
        
        {/* Info Modal */}
        {showInfoModal && (
          <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Understanding Seasonality Analysis</h3>
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

                <div className={styles.infoTip}>
                  <strong>Pro tip:</strong> Look for consistent patterns across different timeframes 
                  that might indicate reliable seasonal effects.
                </div>
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
