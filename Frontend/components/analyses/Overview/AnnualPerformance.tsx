import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { FaExpand, FaQuestion, FaDownload, FaCompress } from 'react-icons/fa';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';
import html2canvas from 'html2canvas';

interface AnnualPerformanceProps {
  symbol: string;
}

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

const AnnualPerformance: React.FC<AnnualPerformanceProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Default annual data structure (will be populated with real data)
  const [annualData, setAnnualData] = useState({
    labels: [] as string[],
    datasets: [{
      label: 'Annual Return (%)',
      data: [] as number[],
      backgroundColor: (context: { dataset: { data: { [x: string]: any; }; }; dataIndex: string | number; }) => {
        const value = context.dataset.data[context.dataIndex];
        return value >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)';
      }
    }]
  });

  const [statistics, setStatistics] = useState({
    bestYear: '',
    worstYear: '',
    average: ''
  });

  // Calculate annual performance from historical data
  const calculateAnnualReturns = (historicalData: HistoricalDataPoint[]) => {
    // Group data by year
    const dataByYear = historicalData.reduce((acc, dataPoint) => {
      const year = new Date(dataPoint.date).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(dataPoint);
      return acc;
    }, {} as Record<number, HistoricalDataPoint[]>);

    // Sort years in ascending order
    const sortedYears = Object.keys(dataByYear)
      .map(Number)
      .sort((a, b) => a - b);

    // Get the most recent year data that has at least some entries
    // This handles partial current year data
    if (sortedYears.length > 0) {
      const currentYear = new Date().getFullYear();
      if (dataByYear[currentYear] && dataByYear[currentYear].length < 5) {
        // If we have very few data points for current year, exclude it
        sortedYears.pop();
      }
    }

    // Calculate returns between consecutive year-end prices
    const annualReturns: number[] = [];
    const yearLabels: string[] = [];
    
    for (let i = 1; i < sortedYears.length; i++) {
      const previousYear = sortedYears[i-1];
      const currentYear = sortedYears[i];
      
      // Get the last data point (year-end) for each year
      const previousYearEnd = dataByYear[previousYear].slice(-1)[0].adjClose;
      const currentYearEnd = dataByYear[currentYear].slice(-1)[0].adjClose;
      
      // Calculate percentage return
      const annualReturn = ((currentYearEnd - previousYearEnd) / previousYearEnd) * 100;
      annualReturns.push(parseFloat(annualReturn.toFixed(2)));
      yearLabels.push(currentYear.toString());
    }

    return {
      labels: yearLabels,
      returns: annualReturns
    };
  };

  // Fetch annual performance data
  useEffect(() => {
    const fetchAnnualData = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate a start date 10 years ago from today
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 30);
        
        // Format dates as ISO strings
        const fromDate = startDate.toISOString();
        const toDate = endDate.toISOString();
        
        // Call the historical API with monthly data using port 3001
        const response = await axios.get(`http://localhost:3001/api/finance/historical`, {
          params: {
            symbol: symbol,
            from: fromDate,
            to: toDate,
            interval: '1mo'
          }
        });
        
        if (!response.data || !response.data.length) {
          throw new Error('No historical data available');
        }
        
        // Calculate annual returns from monthly data
        const calculatedData = calculateAnnualReturns(response.data);
        
        // Update chart data
        setAnnualData({
          labels: calculatedData.labels,
          datasets: [{
            label: 'Annual Return (%)',
            data: calculatedData.returns,
            backgroundColor: (context: { dataset: { data: { [x: string]: any; }; }; dataIndex: string | number; }) => {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)';
            }
          }]
        });
        
        // Calculate statistics based on the real data
        const allReturns = calculatedData.returns;
        if (allReturns.length > 0) {
          const maxReturn = Math.max(...allReturns);
          const maxIndex = allReturns.indexOf(maxReturn);
          const bestYear = calculatedData.labels[maxIndex];
          
          const minReturn = Math.min(...allReturns);
          const minIndex = allReturns.indexOf(minReturn);
          const worstYear = calculatedData.labels[minIndex];
          
          const avgReturn = allReturns.reduce((sum, val) => sum + val, 0) / allReturns.length;
          
          setStatistics({
            bestYear: `${bestYear} (+${maxReturn.toFixed(1)}%)`,
            worstYear: `${worstYear} (${minReturn >= 0 ? '+' : ''}${minReturn.toFixed(1)}%)`,
            average: `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%`
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching annual performance data:', err);
        setError('Failed to load annual performance data');
        setIsLoading(false);
      }
    };
    
    fetchAnnualData();
  }, [symbol]);

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
      link.download = `${symbol}-annual-performance-${formatDateForFilename(new Date())}.png`;
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
    
    <div className={styles.chartCard} ref={chartContainerRef}>
      <div className={styles.chartHeader}>
        <h2>Annual Performance</h2>
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
        className={`${styles.annualChart} ${isFullscreen ? styles.fullscreenChart : ''}`}
        ref={chartRef}
      >
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading annual data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
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
        )}
      </div>
      <div className={styles.chartSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Best Year:</span>
          <span className={styles.summaryValue}>{statistics.bestYear}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Worst Year:</span>
          <span className={styles.summaryValue}>{statistics.worstYear}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Average:</span>
          <span className={styles.summaryValue}>{statistics.average}</span>
        </div>
      </div>
      
      {/* Info Modal */}
      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>About Annual Performance</h3>
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
                <li>Each bar represents the annual return percentage for a specific year</li>
                <li>Green bars indicate positive returns, red bars indicate negative returns</li>
                <li>Hover over any bar to see the exact percentage return for that year</li>
                <li>Download the chart as an image using the download button</li>
                <li>View the chart in fullscreen for a larger display</li>
              </ul>
              
              <h4>Understanding the summary:</h4>
              <p>
                At the bottom of the chart, you can see key statistics including the best and worst 
                performing years, as well as the average annual return across all displayed years.
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

export default AnnualPerformance;
