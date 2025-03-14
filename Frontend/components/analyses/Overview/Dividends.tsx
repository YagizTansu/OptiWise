import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import styles from '../../../styles/Analyses.module.css';
import axios from 'axios';
import { FaDownload, FaExpand, FaQuestion, FaInfoCircle, FaCompress } from 'react-icons/fa';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DividendsProps {
  symbol: string;
}

interface DividendSummary {
  dividendRate?: number;
  dividendYield?: number;
  payoutRatio?: number;
  exDividendDate?: string;
  fiveYearAvgDividendYield?: number;
}

const Dividends: React.FC<DividendsProps> = ({ symbol }) => {
  const [dividendData, setDividendData] = useState<any>(null);
  const [dividendEvents, setDividendEvents] = useState<any[]>([]);
  const [dividendSummary, setDividendSummary] = useState<DividendSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDividendData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Calculate date range for past 5 years
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 5);
        
        // Fetch historical dividend data using chart endpoint with div events
        const chartResponse = await axios.get(`http://localhost:3001/api/finance/chart`, {
          params: {
            symbol: symbol,
            period1: startDate.toISOString(),
            period2: endDate.toISOString(),
            interval: '1mo',
            events: 'div'
          }
        });
        
        // Fetch current dividend information from quoteSummary
        const summaryResponse = await axios.get(`http://localhost:3001/api/finance/quoteSummary`, {
          params: {
            symbol: symbol,
            modules: 'summaryDetail,defaultKeyStatistics'
          }
        });
        
        // Process dividend events from chart data
        let dividends: { date: string; timestamp: number; amount: any; }[] = [];
        
        if (chartResponse.data && 
            chartResponse.data.events && 
            chartResponse.data.events.dividends) {
          
          // Get the dividends array directly from the response
          const dividendEvents = chartResponse.data.events.dividends;
          
          // Process each dividend event
          dividends = dividendEvents.map((dividend: any) => {
            const timestamp = dividend.date || dividend.timestamp;
            const date = new Date(parseInt(timestamp) * 1000);
            const formattedDate = `${date.getMonth() + 1}/${date.getFullYear()}`;
            return {
              date: formattedDate,
              timestamp: parseInt(timestamp),
              amount: dividend.amount,
              fullDate: date
            };
          });
          
          // Sort dividends by timestamp (oldest first)
          dividends.sort((a, b) => a.timestamp - b.timestamp);
          
          setDividendEvents(dividends);
        } else {
          setError('No dividend data available for this stock');
        }
        
        // Extract dividend summary from quoteSummary response
        let summary = null;
        if (summaryResponse.data && 
            summaryResponse.data.quoteSummary && 
            summaryResponse.data.quoteSummary.result && 
            summaryResponse.data.quoteSummary.result[0]) {
          
          const details = summaryResponse.data.quoteSummary.result[0];
          
          summary = {
            dividendRate: details.summaryDetail?.dividendRate?.raw,
            dividendYield: details.summaryDetail?.dividendYield?.raw,
            payoutRatio: details.summaryDetail?.payoutRatio?.raw,
            exDividendDate: details.summaryDetail?.exDividendDate?.fmt,
            fiveYearAvgDividendYield: details.defaultKeyStatistics?.fiveYearAvgDividendYield?.raw
          };
        }
        
        // Prepare chart data
        if (dividends.length > 0) {
          const chartData = {
            labels: dividends.map(div => div.date),
            datasets: [
              {
                label: 'Dividend Amount',
                data: dividends.map(div => div.amount),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.2,
                pointRadius: dividends.length > 20 ? 3 : 4,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#4CAF50',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
              }
            ]
          };
          
          setDividendData(chartData);
        }
        
        setDividendSummary(summary);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dividend data:', error);
        setError(`Failed to load dividend data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchDividendData();
    } else {
      setIsLoading(false);
      setError('Please select a stock symbol to view dividend data');
    }
  }, [symbol]);

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Format date for filename
  const formatDateForFilename = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

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
      link.download = `${symbol}-dividends-${formatDateForFilename(new Date())}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download chart:', error);
      alert('Failed to download chart. Please try again.');
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.analysisCard} ref={chartContainerRef}>
        {/* Header Section */}
        <div className={styles.seasonalityHeader}>
          <h2>Dividend History</h2>
          <p className={styles.seasonalityDescription}>
            <FaInfoCircle className={styles.infoIcon} /> 
            Track dividend payment trends and income potential over time to assess the stock's consistency in 
            delivering shareholder returns.
          </p>
        </div>

        {/* Dividend Summary Section */}
        {!isLoading && dividendSummary && (
          <div className={styles.dividendSummaryContainer}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Dividend Rate:</span>
                <span className={styles.summaryValue}>
                  {dividendSummary.dividendRate ? `$${dividendSummary.dividendRate.toFixed(2)}` : 'N/A'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Dividend Yield:</span>
                <span className={styles.summaryValue}>
                  {formatPercent(dividendSummary.dividendYield)}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Payout Ratio:</span>
                <span className={styles.summaryValue}>
                  {formatPercent(dividendSummary.payoutRatio)}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Ex-Dividend Date:</span>
                <span className={styles.summaryValue}>
                  {dividendSummary.exDividendDate || 'N/A'}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>5Y Avg Dividend Yield:</span>
                <span className={styles.summaryValue}>
                  {formatPercent(dividendSummary.fiveYearAvgDividendYield)}
                </span>
              </div>
            </div>
          </div>
        )}
      
        {/* Chart Controls */}
        <div className={styles.chartHeader}>
          <h3>Payment History (5 Years)</h3>
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
              <p>Loading dividend data...</p>
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
          ) : dividendData ? (
            <Line 
              data={dividendData}
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
                    },
                    title: {
                      display: true,
                      text: 'Dividend Amount ($)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    title: {
                      display: true,
                      text: 'Payment Date'
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
                        const index = tooltipItems[0].dataIndex;
                        const event = dividendEvents[index];
                        return event ? formatDateForDisplay(event.fullDate) : '';
                      },
                      label: function(context) {
                        const event = dividendEvents[context.dataIndex];
                        if (!event) return '';
                        
                        return [
                          `Dividend: $${event.amount.toFixed(2)}`,
                          `Quarterly Growth: ${context.dataIndex > 0 
                            ? ((event.amount / dividendEvents[context.dataIndex-1].amount - 1) * 100).toFixed(2) + '%' 
                            : 'N/A'}`
                        ];
                      }
                    }
                  }
                }
              }}
              height={400}
            />
          ) : (
            <div className={styles.noDataContainer}>
              <p>No dividend data available for {symbol}. This stock may not pay dividends.</p>
              <p>Try selecting a different stock with a history of dividend payments.</p>
            </div>
          )}
        </div>
        
        {/* Info Modal */}
        {showInfoModal && (
          <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>About Dividend Chart</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowInfoModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <h4>Understanding Dividend Data:</h4>
                <ul className={styles.infoList}>
                  <li><b>Dividend Rate:</b> The annual dividend payment per share</li>
                  <li><b>Dividend Yield:</b> Annual dividend as a percentage of current stock price</li>
                  <li><b>Payout Ratio:</b> Percentage of earnings paid as dividends</li>
                  <li><b>Ex-Dividend Date:</b> Date when stock begins trading without dividend value</li>
                  <li><b>5Y Avg Dividend Yield:</b> Average yield over the past 5 years</li>
                </ul>
                
                <h4>Reading the Chart:</h4>
                <p>
                  The chart displays dividend payments over time. Each point represents a dividend distribution.
                  Hover over points to see payment details including the amount and quarterly growth rate.
                </p>
                <p>
                  An upward trend indicates increasing dividend payments, which is generally considered positive for income investors.
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

export default Dividends;
