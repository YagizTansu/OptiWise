import React, { useState, useEffect, useRef } from 'react';
import { FaArrowUp, FaArrowDown, FaChartLine, FaCalendarAlt, FaInfoCircle, FaDownload, FaExpand, FaCompress, FaQuestion } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';
import html2canvas from 'html2canvas';
import { StatisticsData, fetchKeyStatistics } from '../../../services/api/finance';

interface KeyStatisticsProps {
  symbol: string;
}

const KeyStatistics: React.FC<KeyStatisticsProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [statisticsData, setStatisticsData] = useState<StatisticsData>({
    allTimeHigh: '0',
    allTimeLow: '0',
    profitDays: '0%',
    avgHoldPeriod: '0 Years',
    currency: 'USD' // Add default currency
  });
  
  // Add new state and refs for fullscreen and info modal
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getKeyStatistics = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      
      try {
        const stats = await fetchKeyStatistics(symbol);
        setStatisticsData(stats);
      } catch (error) {
        console.error('Error fetching key statistics:', error);
        // Error state is handled in the API function with default values
      } finally {
        setIsLoading(false);
      }
    };
    
    getKeyStatistics();
  }, [symbol]);

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

  // Download statistics as image
  const downloadStats = async () => {
    if (!statsRef.current) return;
    
    try {
      // Set loading indicator or cursor if needed
      document.body.style.cursor = 'wait';
      
      const canvas = await html2canvas(statsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher scale for better quality
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${symbol}-key-statistics-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download statistics:', error);
      alert('Failed to download statistics. Please try again.');
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.cardContainer}>
        <div className={styles.analysisCard}>
          <div className={styles.loadingContainer}>Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cardContainer}>
      <div className={styles.analysisCard} ref={containerRef}>
        {/* Header Section */}
        <div className={styles.seasonalityHeader}>
          <h2>Key Statistics</h2>
          <p className={styles.seasonalityDescription}>
            <FaInfoCircle className={styles.infoIcon} /> 
            Essential metrics summarizing the asset's historical price performance.
          </p>
        </div>
        
        {/* Chart Controls */}
        <div className={styles.chartHeader}>
          <h3>Price Metrics ({statisticsData.currency})</h3>
          <div className={styles.chartControls}>
            <button 
              className={styles.modernActionButton} 
              title="Download Statistics"
              onClick={downloadStats}
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
          className={`${styles.statsGrid} ${isFullscreen ? styles.fullscreenMetrics : ''}`}
          ref={statsRef}
        >
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaArrowUp /></div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statisticsData.currency} {typeof statisticsData.allTimeHigh === 'number' ? statisticsData.allTimeHigh.toFixed(2) : statisticsData.allTimeHigh}</div>
              <div className={styles.statLabel}>All Time High</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaArrowDown /></div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statisticsData.currency} {typeof statisticsData.allTimeLow === 'number' ? statisticsData.allTimeLow.toFixed(2) : statisticsData.allTimeLow}</div>
              <div className={styles.statLabel}>All Time Low</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaChartLine /></div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statisticsData.profitDays}</div>
              <div className={styles.statLabel}>Profit Days</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><FaCalendarAlt /></div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statisticsData.avgHoldPeriod}</div>
              <div className={styles.statLabel}>Avg Hold Period</div>
            </div>
          </div>
        </div>
        
        {/* Info Modal */}
        {showInfoModal && (
          <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>About Key Statistics</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowInfoModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <h4>Understanding these metrics:</h4>
                <ul className={styles.infoList}>
                  <li><strong>All Time High:</strong> The highest price the asset has reached in {statisticsData.currency}</li>
                  <li><strong>All Time Low:</strong> The lowest price the asset has reached in {statisticsData.currency}</li>
                  <li><strong>Profit Days:</strong> Percentage of days where the closing price was higher than the opening price</li>
                  <li><strong>Avg Hold Period:</strong> Average duration of profitable holding periods based on historical data</li>
                </ul>
                
                <p>
                  These statistics provide a quick snapshot of the asset's historical performance extremes
                  and general trading characteristics in {statisticsData.currency}.
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

export default KeyStatistics;
