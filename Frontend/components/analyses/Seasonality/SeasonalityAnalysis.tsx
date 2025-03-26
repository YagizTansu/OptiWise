import { FaChartLine, FaCircle, FaDownload, FaExpand, FaQuestion, FaInfoCircle, FaCompress } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import { useState, useEffect, useRef } from 'react';
import styles from '../../../styles/seasonality/SeasonalityAnalysis.module.css';
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

// Define interface for period selection
interface PeriodOption {
  label: string;
  years: number;
  selected: boolean;
  isCurrentYear?: boolean;  // New property to identify the "Current Year" option
}

const SeasonalityAnalysis: React.FC<SeasonalityAnalysisProps> = ({ symbol }) => {
  // Available period options - updated with Current Year option
  const periodOptions: PeriodOption[] = [
    { label: 'Past Year', years: 1, selected: true },
    { label: '3 Years', years: 3, selected: false },
    { label: '5 Years', years: 5, selected: false },
    { label: '10 Years', years: 10, selected: false },
    { label: '15 Years', years: 15, selected: false },
    { label: '20 Years', years: 20, selected: false },
  ];
  
  // Internal state management with multi-period selection
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodOption[]>(periodOptions);
  // Use 'monthly' as default timeframe and don't expose the selector
  const [activeTimeframe] = useState('monthly'); 
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
  
  // State for API data - now tracking multiple datasets per timeframe
  const [seasonalityData, setSeasonalityData] = useState<{
    monthly: { [key: string]: SeasonalityChartData | null };
    daily: { [key: string]: SeasonalityChartData | null };
    weekly: { [key: string]: SeasonalityChartData | null };
    yearly: { [key: string]: SeasonalityChartData | null };
  }>({
    monthly: {},
    daily: {},
    weekly: {},
    yearly: {}
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

  // Handle toggling period selection
  const togglePeriodSelection = (label: string) => {
    setSelectedPeriods(prevPeriods => {
      const updatedPeriods = prevPeriods.map(period => {
        if (period.label === label) {
          return { ...period, selected: !period.selected };
        }
        return period;
      });
      
      // Ensure at least one period is selected
      const hasSelected = updatedPeriods.some(p => p.selected);
      if (!hasSelected) {
        return prevPeriods; // Return original state if trying to deselect all
      }
      
      return updatedPeriods;
    });
  };

  // Load data when component mounts or when parameters change
  useEffect(() => {
    // Only proceed if we have selected periods
    const activePeriods = selectedPeriods.filter(p => p.selected);
    if (activePeriods.length === 0) return;
    
    // Reset error state
    setError(null);
    setIsLoading(true);
    
    const loadData = async () => {
      try {
        // We'll track all the data we're fetching
        const newData = {
          daily: { ...seasonalityData.daily },
          weekly: { ...seasonalityData.weekly },
          monthly: { ...seasonalityData.monthly },
          yearly: { ...seasonalityData.yearly }
        };
        
        // Create a queue of promises for each period
        const promises = activePeriods.map(async period => {
          // Create a special key for Current Year to differentiate from Past Year
          const periodKey = period.isCurrentYear 
            ? 'current_year' 
            : `${period.years}_years`;
          
          // If we don't have data for this period, fetch it
          if (!newData[activeTimeframe as keyof typeof newData][periodKey]) {
            try {
              // Special handling for Current Year (Jan 1 to today)
              const periodParam = period.isCurrentYear 
                ? { 
                    label: period.label, 
                    years: period.years,
                    isCurrentYear: true  // Pass this flag to API
                  }
                : { 
                    label: period.label, 
                    years: period.years 
                  };
              
              const allData = await fetchSeasonalityData(
                symbol,
                activeTimeframe,
                [periodParam]
              );
              
              if (allData && allData.labels && allData.datasets && allData.datasets.length > 0) {
                // Update the dataset label to match the period
                const updatedDataset = {
                  ...allData,
                  datasets: allData.datasets.map(ds => ({
                    ...ds,
                    label: period.label
                  }))
                };
                
                // Store data for this period
                if (activeTimeframe === 'daily') newData.daily[periodKey] = updatedDataset;
                if (activeTimeframe === 'weekly') newData.weekly[periodKey] = updatedDataset;
                if (activeTimeframe === 'monthly') newData.monthly[periodKey] = updatedDataset;
                if (activeTimeframe === 'yearly') newData.yearly[periodKey] = updatedDataset;
              }
            } catch (error) {
              console.error(`Error fetching data for ${period.label}:`, error);
              // Don't set global error here, continue with other periods
            }
          }
        });
        
        // Wait for all fetches to complete
        await Promise.all(promises);
        
        // Update state with all the data
        setSeasonalityData(newData);
        setIsLoading(false);
      } catch (err) {
        console.error(`Error loading seasonality data:`, err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedPeriods, activeTimeframe, symbol]);

  // Function to get the current seasonality data based on the timeframe
  const getCurrentSeasonalityData = () => {
    const timeframeData = seasonalityData[activeTimeframe as keyof typeof seasonalityData];
    
    // Get active periods
    const activePeriods = selectedPeriods.filter(p => p.selected);
    
    // Check if we have any data
    if (Object.keys(timeframeData).length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    // Find the first dataset with data to use as a template for labels
    let labels: string[] = [];
    let allDatasets: any[] = [];
    
    // Color palette for multiple datasets
    const colorPalette = [
      { border: 'rgb(76, 175, 80)', background: 'rgba(76, 175, 80, 0.7)' },  // Green for Current Year
      { border: 'rgb(53, 162, 235)', background: 'rgba(53, 162, 235, 0.7)' },
      { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.7)' },
      { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.7)' },
      { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.7)' },
      { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.7)' },
      { border: 'rgb(255, 205, 86)', background: 'rgba(255, 205, 86, 0.7)' },
    ];
    
    // Loop through active periods and add their datasets if available
    activePeriods.forEach((period, index) => {
      // Use a special key for Current Year
      const periodKey = period.isCurrentYear 
        ? 'current_year' 
        : `${period.years}_years`;
        
      const periodData = timeframeData[periodKey];
      
      if (periodData && periodData.labels && periodData.datasets && periodData.datasets.length > 0) {
        // Use the first dataset with data as the source of labels
        if (labels.length === 0) {
          labels = periodData.labels;
        }
        
        // Add dataset with styling
        const colorIndex = index % colorPalette.length;
        const color = colorPalette[colorIndex];
        
        periodData.datasets.forEach(dataset => {
          allDatasets.push({
            ...dataset,
            label: period.label,
            borderColor: color.border,
            backgroundColor: viewMode === 'line' ? 'rgba(0, 0, 0, 0.1)' : color.background,
            fill: viewMode === 'line' ? false : undefined,
            pointBackgroundColor: color.border,
            pointBorderColor: '#fff',
            pointBorderWidth: 1.5,
            pointHoverBackgroundColor: color.border,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            pointHoverRadius: 6,
            barPercentage: 0.8,
            categoryPercentage: 0.7
          });
        });
      }
    });
    
    return {
      labels: labels,
      datasets: allDatasets
    };
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
    const data = getCurrentSeasonalityData();
    return data.labels && data.labels.length > 0 && 
           data.datasets && data.datasets.length > 0;
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
          <h3>{getChartTitle()}</h3>
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
          
          {/* Multi-period selection */}
          <div className={styles.periodsSelectionContainer}>
            <div className={styles.periodsSelectionHeader}>
              <FaInfoCircle className={styles.infoIcon} />
              <span>Select Periods:</span>
            </div>
            <div className={styles.periodsSelectionGroup}>
              {selectedPeriods.map(period => (
                <button 
                  key={period.label}
                  className={`${styles.periodToggleButton} ${period.selected ? styles.active : ''}`}
                  onClick={() => togglePeriodSelection(period.label)}
                  type="button"
                >
                  {period.selected && <span className={styles.periodCheckmark}>✓</span>}
                  <span className={styles.periodLabel}>{period.label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Removed the timeframe selector section */}
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
                  <li>Select multiple time periods to overlay historical performance patterns</li>
                  <li>Toggle between line and bar chart views for different visualizations</li>
                  <li>Show or hide data points for clearer reading</li>
                  <li>Download the chart as an image using the download button</li>
                </ul>
                <p>
                  Seasonal patterns can help inform trading and investment decisions, particularly for assets 
                  that show consistent performance during specific periods.
                </p>
                <div className={styles.infoTip}>
                  <strong>Pro tip:</strong> Compare patterns across different time horizons to identify 
                  which seasonal effects are consistent over time versus those that might be temporary. 
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
