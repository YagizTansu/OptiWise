import { FaExpand, FaInfoCircle, FaCompress, FaTimes, FaDownload, FaQuestion } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect, useRef } from 'react';
import styles from '../../../styles/seasonality/TimeAverageReturns.module.css';
import html2canvas from 'html2canvas';
import { 
  fetchTimeAverageReturns, 
  TimeAverageReturnData, 
  ReturnStatisticData 
} from '../../../services/api/finance';

interface TimeAverageReturnsProps {
  symbol: string;
}

const TimeAverageReturns: React.FC<TimeAverageReturnsProps> = ({ symbol }) => {
  // Internal state management
  const [selectedPeriod, setSelectedPeriod] = useState('5 Years');
  const [selectedView, setSelectedView] = useState('monthly');
  const [chartData, setChartData] = useState<TimeAverageReturnData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<ReturnStatisticData[]>([]);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Fetch data from API
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchTimeAverageReturns(symbol, selectedPeriod, selectedView);
      setChartData(result.chartData);
      setStatsData(result.statistics);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data when selectedPeriod or selectedView changes
  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedView, symbol]);
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Average Returns for ${symbol}`,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Return %'
        }
      }
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    if (!chartContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      try {
        if (chartContainerRef.current.requestFullscreen) {
          await chartContainerRef.current.requestFullscreen();
        } else if ((chartContainerRef.current as any).webkitRequestFullscreen) {
          await (chartContainerRef.current as any).webkitRequestFullscreen();
        } else if ((chartContainerRef.current as any).msRequestFullscreen) {
          await (chartContainerRef.current as any).msRequestFullscreen();
        }
      } catch (err) {
        console.error('Could not enter fullscreen mode:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } catch (err) {
        console.error('Could not exit fullscreen mode:', err);
      }
    }
  };
  
  // Update the handleDownload function to use html2canvas consistently with other components
  const handleDownload = async () => {
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
      link.download = `${symbol}-${selectedView}-average-returns-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download chart:', error);
      alert('Failed to download chart. Please try again.');
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement !== null || 
        (document as any).webkitFullscreenElement !== null ||
        (document as any).msFullscreenElement !== null
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={styles.cardContainer}>
      <div className={styles.analysisCard} ref={chartContainerRef}>
        {/* Header Section */}
        <div className={styles.seasonalityHeader}>
          <h2>Time Average Returns</h2>
          <p className={styles.seasonalityDescription}>
            <FaInfoCircle className={styles.infoIcon} /> 
            Analyze average returns across different time periods to identify consistent patterns and performance trends.
          </p>
        </div>
      
        {/* Chart Controls */}
        <div className={styles.chartHeader}>
          <h3>Average Returns Analysis</h3>
          <div className={styles.chartControls}>
            <button 
              className={styles.modernActionButton} 
              title="Download Chart"
              onClick={handleDownload}
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
      
        <div className={styles.seasonalityControls}>
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>Analysis Period:</label>
            <div className={styles.seasonalityTimeframeSelector}>
              {['1 Year', '3 Years', '5 Years', '10 Years', 'Max'].map((period) => (
                <button 
                  key={period}
                  className={selectedPeriod === period ? styles.modernTabButton + ' ' + styles.activeTab : styles.modernTabButton}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>View:</label>
            <div className={styles.viewSelector}>
              {['daily', 'monthly', 'yearly'].map((view) => (
                <button 
                  key={view}
                  className={selectedView === view ? styles.activeView : styles.viewButton}
                  onClick={() => setSelectedView(view)}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div 
          className={`${styles.chartContainer} ${isFullscreen ? styles.fullscreenChart : ''}`}
          ref={chartRef}
        >
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading chart data...</p>
            </div>
          )}
          
          {error && (
            <div className={styles.errorContainer}>
              <FaInfoCircle className={styles.errorIcon} />
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && chartData && (
            <Bar data={chartData} options={chartOptions} className={styles.trendChart} />
          )}
        </div>
        
        {!loading && !error && statsData.length > 0 && (
          <div className={styles.statsTableContainer}>
            <h4>Detailed Statistics</h4>
            <div className={styles.extremesTable}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Avg. Return</th>
                    <th>Std. Dev.</th>
                    <th>Win Rate</th>
                    <th>Best</th>
                    <th>Worst</th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.period}</td>
                      <td className={row.avgReturn >= 0 ? styles.positive : styles.negative}>
                        {row.avgReturn >= 0 ? '+' : ''}{row.avgReturn.toFixed(1)}%
                      </td>
                      <td>{row.stdDev.toFixed(1)}%</td>
                      <td>{row.winRate.toFixed(0)}%</td>
                      <td className={styles.positive}>+{row.best.toFixed(1)}%</td>
                      <td className={styles.negative}>{row.worst.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={styles.bestWorstDays}>
              <div className={styles.bestDay}>
                Best performing: <span>{getBestPerformingPeriod()}</span>
              </div>
              <div className={styles.worstDay}>
                Worst performing: <span>{getWorstPerformingPeriod()}</span>
              </div>
            </div>
          </div>
        )}
      
        {/* Info Modal */}
        {showInfoModal && (
          <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Average Returns by Time Period</h3>
                <button 
                  className={styles.closeButton} 
                  onClick={() => setShowInfoModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>
                  This chart shows the average returns of {symbol} broken down by different time periods.
                  You can analyze patterns in returns based on days of the month, months of the year,
                  or yearly performance.
                </p>
                
                <h4>How to use this chart:</h4>
                <ul className={styles.infoList}>
                  <li>
                    <strong>Analysis Period</strong> - Select the historical period to analyze
                    (1 Year, 3 Years, 5 Years, 10 Years, or Maximum available data)
                  </li>
                  <li>
                    <strong>View Mode</strong> - Choose between Daily (day of month), Monthly, or Yearly views
                  </li>
                  <li>
                    <strong>Daily View</strong> - Shows average returns for each day of the month (1-31)
                  </li>
                  <li>
                    <strong>Monthly View</strong> - Shows average returns for each month of the year
                  </li>
                  <li>
                    <strong>Yearly View</strong> - Shows average returns by year
                  </li>
                </ul>
                
                <h4>Understanding the statistics:</h4>
                <ul className={styles.infoList}>
                  <li>
                    <strong>Avg. Return</strong> - The average percentage return for that period
                  </li>
                  <li>
                    <strong>Std. Dev.</strong> - Standard deviation, a measure of volatility
                  </li>
                  <li>
                    <strong>Win Rate</strong> - Percentage of time the asset has positive returns in this period
                  </li>
                  <li>
                    <strong>Best</strong> - The best return recorded during this period
                  </li>
                  <li>
                    <strong>Worst</strong> - The worst return recorded during this period
                  </li>
                </ul>
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
  
  // Helper functions to identify best and worst periods
  function getBestPerformingPeriod() {
    if (statsData.length === 0) return 'N/A';
    const best = [...statsData].sort((a, b) => b.avgReturn - a.avgReturn)[0];
    return `${best.period} (+${best.avgReturn.toFixed(1)}%)`;
  }
  
  function getWorstPerformingPeriod() {
    if (statsData.length === 0) return 'N/A';
    const worst = [...statsData].sort((a, b) => a.avgReturn - b.avgReturn)[0];
    return `${worst.period} (${worst.avgReturn.toFixed(1)}%)`;
  }
};

export default TimeAverageReturns;
