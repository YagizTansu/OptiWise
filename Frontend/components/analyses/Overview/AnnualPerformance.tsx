import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { FaExpand, FaQuestion, FaDownload, FaCompress, FaInfoCircle } from 'react-icons/fa';
import styles from '../../../styles/overview/AnnualPerformance.module.css';
import html2canvas from 'html2canvas';
import { fetchAnnualPerformance } from '../../../services/api/finance';

interface AnnualPerformanceProps {
  symbol: string;
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

  // Fetch annual performance data
  useEffect(() => {
    const getAnnualData = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get annual performance data from the finance service
        const result = await fetchAnnualPerformance(symbol);
        
        // Update chart data
        setAnnualData({
          labels: result.labels,
          datasets: [{
            label: 'Annual Return (%)',
            data: result.returns,
            backgroundColor: (context: { dataset: { data: { [x: string]: any; }; }; dataIndex: string | number; }) => {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)';
            }
          }]
        });
        
        // Set statistics
        setStatistics(result.statistics);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching annual performance data:', err);
        setError('Failed to load annual performance data');
        setIsLoading(false);
      }
    };
    
    getAnnualData();
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
    <div className={styles.cardContainer}>
      <div className={styles.analysisCard} ref={chartContainerRef}>
        {/* Header Section */}
        <div className={styles.seasonalityHeader}>
          <h2>Annual Performance</h2>
          <p className={styles.seasonalityDescription}>
            <FaInfoCircle className={styles.infoIcon} /> 
            Analyze yearly returns to understand historical performance patterns over time.
          </p>
        </div>
        
        {/* Chart Controls */}
        <div className={styles.chartHeader}>
          <h3>Yearly Returns</h3>
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
    </div>
  );
};

export default AnnualPerformance;
