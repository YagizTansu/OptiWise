import React, { useState, useEffect, useRef } from 'react';
import { FaArrowUp, FaArrowDown, FaQuestion, FaDownload, FaExpand, FaCompress, FaInfoCircle } from 'react-icons/fa';
import styles from '../../../styles/overview/PerformanceMetrics.module.css';
import html2canvas from 'html2canvas';
import { PeriodData, fetchPerformanceMetrics } from '../../../services/api/finance';

interface PerformanceMetricsProps {
  symbol: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ symbol }) => {
  // Define performance periods
  const performancePeriodDefinitions = [
    { label: '1M', months: 1 },
    { label: '3M', months: 3 },
    { label: '6M', months: 6 },
    { label: '1Y', months: 12 },
    { label: '3Y', months: 36 },
    { label: '5Y', months: 60 },
    { label: '10Y', months: 120 },
    { label: '20Y', months: 240 },
  ];
  
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [metrics, setMetrics] = useState<PeriodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const metricsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for period changes from other components
  useEffect(() => {
    const handlePeriodChange = (event: CustomEvent) => {
      setSelectedPeriod(event.detail);
    };
    
    document.addEventListener('periodChange', handlePeriodChange as EventListener);
    
    return () => {
      document.removeEventListener('periodChange', handlePeriodChange as EventListener);
    };
  }, []);
  
  // Fetch real performance metrics based on the symbol
  useEffect(() => {
    if (!symbol) return;
    
    const getMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const results = await fetchPerformanceMetrics(symbol, performancePeriodDefinitions);
        setMetrics(results);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        setError('Failed to load performance metrics');
      } finally {
        setIsLoading(false);
      }
    };
    
    getMetrics();
  }, [symbol]);
  
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Notify other components about period change
    document.dispatchEvent(new CustomEvent('periodChange', { detail: period }));
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

  // Download metrics as image
  const downloadMetrics = async () => {
    if (!metricsRef.current) return;
    
    try {
      // Set loading indicator or cursor if needed
      document.body.style.cursor = 'wait';
      
      const canvas = await html2canvas(metricsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher scale for better quality
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${symbol}-performance-metrics-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download metrics:', error);
      alert('Failed to download metrics. Please try again.');
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading metrics...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.cardContainer}>
      <div className={styles.analysisCard} ref={containerRef}>
        {/* Header Section */}
        <div className={styles.seasonalityHeader}>
          <h2>Performance Metrics</h2>
          <p className={styles.seasonalityDescription}>
            <FaInfoCircle className={styles.infoIcon} /> 
            Compare returns across different time periods to track investment performance.
          </p>
        </div>
        
        {/* Chart Controls */}
        <div className={styles.chartHeader}>
          <h3>Time Period Returns</h3>
          <div className={styles.chartControls}>
            <button 
              className={styles.modernActionButton} 
              title="Download Metrics"
              onClick={downloadMetrics}
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
        
        {/* Metrics Grid */}
        <div 
          className={`${styles.metricsGrid} ${isFullscreen ? styles.fullscreenMetrics : ''}`}
          ref={metricsRef}
        >
          {metrics.map((period) => (
            <div 
              key={period.label} 
              className={`${styles.metricCard} ${period.value >= 0 ? styles.positive : styles.negative} ${selectedPeriod === period.label ? styles.selectedPeriod : ''}`}
              onClick={() => handlePeriodChange(period.label)}
            >
              <div className={styles.metricHeader}>
                <span className={styles.periodLabel}>{period.label}</span>
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
      
      {/* Info Modal */}
      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>About Performance Metrics</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowInfoModal(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <h4>How to use these metrics:</h4>
              <ul className={styles.infoList}>
                <li>Performance metrics show the percentage change in stock value over different time periods</li>
                <li>Click on any time period to update all related charts and analyses</li>
                <li>Green indicates positive returns, red indicates negative returns</li>
                <li>The currently selected period is highlighted and marked as "Active"</li>
                <li>Download the metrics panel as an image using the download button</li>
                <li>View the metrics in fullscreen for a larger display</li>
              </ul>
              
              <p>
                When you select a time period, all other components on the page will update 
                to reflect data for the same period, providing a consistent view of the asset's 
                performance across different analyses.
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

export default PerformanceMetrics;
