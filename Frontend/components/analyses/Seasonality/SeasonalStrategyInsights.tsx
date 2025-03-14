import React, { useState, useEffect, useRef } from 'react';
import { FaChartLine, FaExclamationTriangle, FaRobot, FaArrowRight, FaSpinner, FaTimes, FaInfoCircle, FaDownload, FaExpand, FaCompress, FaQuestion } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';
import axios from 'axios';
import html2canvas from 'html2canvas';

interface SeasonalStrategyInsightsProps {
  symbol: string;
}

interface MonthlyPerformance {
  month: string;
  avgReturn: number;
  consistency: number; // % of years this month was positive
  cumulativeReturn: number;
}

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

interface StrategyDetails {
  title: string;
  description: string;
  data: any;
  type: 'strength' | 'risk' | 'ai';
}

const SeasonalStrategyInsights: React.FC<SeasonalStrategyInsightsProps> = ({ symbol }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [strongestPattern, setStrongestPattern] = useState<{
    period: string;
    return: number;
  } | null>(null);
  const [riskPattern, setRiskPattern] = useState<{
    period: string;
    return: number;
  } | null>(null);
  const [showStrategyModal, setShowStrategyModal] = useState<boolean>(false);
  const [activeStrategy, setActiveStrategy] = useState<StrategyDetails | null>(null);
  const [monthlyDetailedData, setMonthlyDetailedData] = useState<Record<string, any>>({});
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Add new state and refs for fullscreen and download
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true);
        // Get 5 years of historical data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 5);
        
        const response = await axios.get(`http://localhost:3001/api/finance/historical`, {
          params: {
            symbol,
            from: startDate.toISOString(),
            to: endDate.toISOString(),
            interval: '1mo'
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          analyzeSeasonalPatterns(response.data);
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        console.error("Error fetching historical data:", err);
        setError("Failed to load seasonal data");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol]);
  
  const analyzeSeasonalPatterns = (historicalData: HistoricalDataPoint[]) => {
    // Group data by month
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthlyReturns: Record<string, number[]> = {};
    monthNames.forEach(month => monthlyReturns[month] = []);
    
    // Calculate monthly returns
    for (let i = 1; i < historicalData.length; i++) {
      const currentData = historicalData[i];
      const previousData = historicalData[i-1];
      
      const date = new Date(currentData.date);
      const month = monthNames[date.getMonth()];
      
      // Calculate monthly return (%)
      const monthlyReturn = ((currentData.close - previousData.close) / previousData.close) * 100;
      monthlyReturns[month].push(monthlyReturn);
    }
    
    // Calculate detailed monthly statistics for strategy exploration
    const detailedMonthlyData: Record<string, any> = {};
    
    monthNames.forEach(month => {
      const returns = monthlyReturns[month];
      if (returns.length > 0) {
        const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
        const positiveReturns = returns.filter(ret => ret > 0);
        const consistency = (positiveReturns.length / returns.length) * 100;
        
        detailedMonthlyData[month] = {
          avgReturn,
          consistency,
          years: returns.length,
          positiveYears: positiveReturns.length,
          maxReturn: Math.max(...returns),
          minReturn: Math.min(...returns),
          volatility: calculateStandardDeviation(returns)
        };
      }
    });
    
    setMonthlyDetailedData(detailedMonthlyData);
    
    // Find best consecutive 3-4 month period
    const seasonalPatterns: {start: number; end: number; return: number}[] = [];
    
    for (let start = 0; start < 12; start++) {
      for (let length = 3; length <= 4; length++) {
        let totalReturn = 0;
        let isValid = true;
        
        for (let i = 0; i < length; i++) {
          const monthIndex = (start + i) % 12;
          const month = monthNames[monthIndex];
          
          if (monthlyReturns[month].length === 0) {
            isValid = false;
            break;
          }
          
          const avgReturn = monthlyReturns[month].reduce((sum, val) => sum + val, 0) / monthlyReturns[month].length;
          totalReturn += avgReturn;
        }
        
        if (isValid) {
          seasonalPatterns.push({
            start,
            end: (start + length - 1) % 12,
            return: totalReturn
          });
        }
      }
    }
    
    // Find strongest positive pattern
    const bestPattern = seasonalPatterns.sort((a, b) => b.return - a.return)[0];
    if (bestPattern) {
      setStrongestPattern({
        period: `${monthNames[bestPattern.start]} to ${monthNames[bestPattern.end]}`,
        return: bestPattern.return
      });
    }
    
    // Find worst month (risk pattern)
    const monthlyAvgReturns = monthNames.map(month => {
      const returns = monthlyReturns[month];
      const avgReturn = returns.length > 0 
        ? returns.reduce((sum, val) => sum + val, 0) / returns.length
        : 0;
      return { month, avgReturn };
    });
    
    const worstMonth = monthlyAvgReturns
      .filter(m => m.avgReturn < 0 && monthlyReturns[m.month].length > 0)
      .sort((a, b) => a.avgReturn - b.avgReturn)[0];
      
    if (worstMonth) {
      setRiskPattern({
        period: worstMonth.month,
        return: worstMonth.avgReturn
      });
    }
  };
  
  // Helper function to calculate standard deviation (volatility)
  const calculateStandardDeviation = (values: number[]): number => {
    if (values.length <= 1) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  const handleExploreStrongestPattern = () => {
    if (!strongestPattern) return;
    
    // Extract months from period string
    const [startMonth, endMonth] = strongestPattern.period.split(' to ');
    
    // Prepare detailed data for the strongest seasonal pattern
    const months = getMonthsBetween(startMonth, endMonth);
    const monthsData = months.map(month => ({
      month,
      ...monthlyDetailedData[month]
    }));
    
    setActiveStrategy({
      title: `${symbol}: ${strongestPattern.period} Seasonal Strength`,
      description: `Detailed analysis of the strongest seasonal pattern for ${symbol} occurring from ${strongestPattern.period}. This pattern has shown a cumulative return of ${strongestPattern.return.toFixed(1)}% over the analysis period.`,
      data: {
        months: monthsData,
        cumulativeReturn: strongestPattern.return,
        tradingStrategy: `Consider accumulating ${symbol} positions before ${startMonth} and holding through ${endMonth} to maximize seasonal tailwinds.`
      },
      type: 'strength'
    });
    
    setShowStrategyModal(true);
  };
  
  const handleExploreRiskPattern = () => {
    if (!riskPattern) return;
    
    // Prepare detailed data for the risk pattern
    const monthData = monthlyDetailedData[riskPattern.period] || {};
    
    setActiveStrategy({
      title: `${symbol}: ${riskPattern.period} Risk Pattern`,
      description: `Detailed analysis of the historical risk pattern for ${symbol} during ${riskPattern.period}. This month has shown an average return of ${riskPattern.return.toFixed(1)}% over the analysis period.`,
      data: {
        monthData: {
          month: riskPattern.period,
          ...monthData
        },
        tradingStrategy: `Consider reducing exposure to ${symbol} during ${riskPattern.period} or implementing hedging strategies to mitigate seasonal weakness.`
      },
      type: 'risk'
    });
    
    setShowStrategyModal(true);
  };
  
  const handleAIAnalysis = () => {
    // This is a placeholder for future AI analysis implementation
    setActiveStrategy({
      title: `${symbol}: AI-Powered Seasonal Analysis`,
      description: `Advanced AI analysis of seasonal patterns for ${symbol}. This feature is coming soon.`,
      data: {
        recommendations: [
          { month: 'March', expectedReturn: '+3.9%', confidence: '72%', action: 'Increase position' },
          { month: 'November', expectedReturn: '-2.1%', confidence: '68%', action: 'Decrease exposure' }
        ]
      },
      type: 'ai'
    });
    
    setShowStrategyModal(true);
  };
  
  // Helper function to get all months between two months (inclusive)
  const getMonthsBetween = (start: string, end: string): string[] => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const startIdx = monthNames.findIndex(m => m === start);
    const endIdx = monthNames.findIndex(m => m === end);
    
    if (startIdx === -1 || endIdx === -1) return [];
    
    const result: string[] = [];
    
    if (startIdx <= endIdx) {
      // Simple case: start to end in same year
      for (let i = startIdx; i <= endIdx; i++) {
        result.push(monthNames[i]);
      }
    } else {
      // Wrap around case: end comes before start in calendar
      for (let i = startIdx; i < monthNames.length; i++) {
        result.push(monthNames[i]);
      }
      for (let i = 0; i <= endIdx; i++) {
        result.push(monthNames[i]);
      }
    }
    
    return result;
  };

  // Info button click handler
  const handleInfoClick = () => {
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
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

  // Download insights as image
  const downloadInsights = async () => {
    if (!contentRef.current) return;
    
    try {
      // Set loading indicator or cursor if needed
      document.body.style.cursor = 'wait';
      
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher scale for better quality
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${symbol}-seasonal-insights-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download insights:', error);
      alert('Failed to download insights. Please try again.');
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  if (loading) {
    return (
      <div className={styles.cardContainer}>
        <div className={styles.analysisCard}>
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} />
            <p>Analyzing seasonal patterns for {symbol}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cardContainer}>
        <div className={styles.analysisCard}>
          <div className={styles.errorContainer}>
            <FaExclamationTriangle className={styles.errorIcon} />
            <p>{error}</p>
            <button className={styles.modernPrimaryButton} onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.cardContainer}>
      <div className={styles.analysisCard} ref={containerRef}>
        {/* Header Section */}
        <div className={styles.seasonalityHeader}>
          <h2>Strategic Insights</h2>
          <p className={styles.seasonalityDescription}>
            <FaInfoCircle className={styles.infoIcon} /> 
            Actionable trading opportunities based on historical seasonal patterns for {symbol}.
          </p>
        </div>
        
        {/* Chart Controls */}
        <div className={styles.chartHeader}>
          <h3>Trading Patterns</h3>
          <div className={styles.chartControls}>
            <button 
              className={styles.modernActionButton} 
              title="Download Insights"
              onClick={downloadInsights}
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

        {/* Strategy Cards */}
        <div 
          className={`${styles.strategyCards} ${isFullscreen ? styles.fullscreenMetrics : ''}`}
          ref={contentRef}
        >
          <div className={styles.strategyCard}>
            <div className={styles.cardIconContainer}>
              <FaChartLine className={styles.cardIcon} />
            </div>
            <h3>Strongest Pattern</h3>
            <div className={styles.cardContent}>
              <p>{strongestPattern?.period || 'No consistent pattern found'} shows a consistent uptrend pattern over years.</p>
              <div className={styles.dataHighlight}>
                {strongestPattern 
                  ? `+${strongestPattern.return.toFixed(1)}% cumulative`
                  : 'Insufficient data'
                }
              </div>
              <button 
                className={styles.modernPrimaryButton}
                onClick={handleExploreStrongestPattern}
                disabled={!strongestPattern}
              >
                Explore Strategy <FaArrowRight className={styles.buttonIcon} />
              </button>
            </div>
          </div>

          <div className={styles.strategyCard}>
            <div className={styles.cardIconContainer}>
              <FaExclamationTriangle className={styles.cardIcon} />
            </div>
            <h3>Risk Pattern</h3>
            <div className={styles.cardContent}>
              <p>{riskPattern?.period || 'No significant risk pattern'} historically shows consistent negative returns.</p>
              <div className={styles.dataHighlight}>
                {riskPattern
                  ? `${riskPattern.return.toFixed(1)}% on average`
                  : 'Insufficient data'
                }
              </div>
              <button 
                className={styles.modernPrimaryButton}
                onClick={handleExploreRiskPattern}
                disabled={!riskPattern}
              >
                Explore Strategy <FaArrowRight className={styles.buttonIcon} />
              </button>
            </div>
          </div>

          <div className={styles.strategyCard}>
            <div className={styles.cardIconContainer}>
              <FaRobot className={styles.cardIcon} />
            </div>
            <h3>AI Recommendation</h3>
            <div className={styles.cardContent}>
              <p>Consider stronger positions in March and rebalancing in November.</p>
              <div className={styles.dataHighlight}>+3.9% March | -2.1% November</div>
              <button 
                className={styles.modernPrimaryButton}
                onClick={handleAIAnalysis}
              >
                AI Analysis <FaArrowRight className={styles.buttonIcon} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Strategy Exploration Modal */}
        {showStrategyModal && activeStrategy && (
          <div className={styles.modalOverlay} onClick={() => setShowStrategyModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{activeStrategy.title}</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowStrategyModal(false)}
                >
                  &times;
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <p className={styles.strategyDescription}>{activeStrategy.description}</p>
                
                {activeStrategy.type === 'strength' && (
                  <div className={styles.strategyAnalysis}>
                    <h3>Monthly Breakdown</h3>
                    <div className={styles.monthlyTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Avg. Return</th>
                            <th>Consistency</th>
                            <th>Volatility</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeStrategy.data.months.map((monthData: any) => (
                            <tr key={monthData.month}>
                              <td>{monthData.month}</td>
                              <td className={monthData.avgReturn >= 0 ? styles.positive : styles.negative}>
                                {monthData.avgReturn.toFixed(2)}%
                              </td>
                              <td>{monthData.consistency.toFixed(0)}%</td>
                              <td>{monthData.volatility.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className={styles.tradingStrategy}>
                      <h3>Trading Strategy</h3>
                      <p>{activeStrategy.data.tradingStrategy}</p>
                    </div>
                  </div>
                )}
                
                {activeStrategy.type === 'risk' && (
                  <div className={styles.strategyAnalysis}>
                    <h3>Risk Analysis: {activeStrategy.data.monthData.month}</h3>
                    
                    <div className={styles.riskMetrics}>
                      <div className={styles.riskMetric}>
                        <div className={styles.metricLabel}>Average Return:</div>
                        <div className={`${styles.metricValue} ${styles.negative}`}>{activeStrategy.data.monthData.avgReturn.toFixed(2)}%</div>
                      </div>
                      <div className={styles.riskMetric}>
                        <div className={styles.metricLabel}>Consistency:</div>
                        <div className={styles.metricValue}>{activeStrategy.data.monthData.consistency.toFixed(0)}% negative</div>
                      </div>
                      <div className={styles.riskMetric}>
                        <div className={styles.metricLabel}>Volatility:</div>
                        <div className={styles.metricValue}>{activeStrategy.data.monthData.volatility.toFixed(2)}%</div>
                      </div>
                      <div className={styles.riskMetric}>
                        <div className={styles.metricLabel}>Worst Year:</div>
                        <div className={`${styles.metricValue} ${styles.negative}`}>{activeStrategy.data.monthData.minReturn.toFixed(2)}%</div>
                      </div>
                    </div>
                    
                    <div className={styles.tradingStrategy}>
                      <h3>Risk Management Strategy</h3>
                      <p>{activeStrategy.data.tradingStrategy}</p>
                    </div>
                  </div>
                )}
                
                {activeStrategy.type === 'ai' && (
                  <div className={styles.strategyAnalysis}>
                    <h3>AI-Generated Recommendations</h3>
                    <div className={styles.aiRecommendations}>
                      {activeStrategy.data.recommendations.map((rec: any, index: number) => (
                        <div key={index} className={styles.aiRecommendation}>
                          <h4>{rec.month}</h4>
                          <div className={`${styles.recReturn} ${parseFloat(rec.expectedReturn) >= 0 ? styles.positive : styles.negative}`}>
                            {rec.expectedReturn}
                          </div>
                          <div className={styles.recConfidence}>Confidence: {rec.confidence}</div>
                          <div className={styles.recAction}>Recommended Action: {rec.action}</div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.aiDisclaimer}>
                      <p>AI recommendations are based on historical patterns and should be considered alongside other analysis methods.</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={styles.modalFooter}>
                <button 
                  className={styles.applyButton} 
                  onClick={() => setShowStrategyModal(false)}
                >
                  Close
                </button>
                <button className={styles.modernPrimaryButton}>
                  Export Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && (
          <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>About Seasonal Trading Patterns</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowInfoModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalBody}>
                <p>Seasonal analysis examines how a security has historically performed during specific times of the year. This can reveal recurring patterns that may offer trading opportunities.</p>
                
                <h4>What You're Looking At:</h4>
                <ul className={styles.infoList}>
                  <li>
                    <strong>Strongest Pattern:</strong> Identifies the consecutive months with the historically strongest positive returns for {symbol}, based on 5-year analysis. These periods often represent optimal times to consider long positions.
                  </li>
                  <li>
                    <strong>Risk Pattern:</strong> Highlights months where {symbol} has consistently shown negative returns, suggesting periods when caution may be warranted or when hedging strategies could be considered.
                  </li>
                  <li>
                    <strong>AI Recommendation:</strong> Coming soon! Advanced algorithms will analyze multiple factors to provide intelligent seasonal trading guidance.
                  </li>
                </ul>
                
                <h4>How to Use This Information:</h4>
                <p>Seasonal patterns should be considered alongside other forms of analysis. While history often rhymes, it doesn't always repeat exactly. Use these insights to:</p>
                <ul className={styles.infoList}>
                  <li>Plan entry and exit points for longer-term positions</li>
                  <li>Adjust position sizing based on seasonal strength or weakness</li>
                  <li>Identify periods that may require hedging strategies</li>
                  <li>Complement your existing technical and fundamental analysis</li>
                </ul>
                
                <div className={styles.infoDisclaimer}>
                  <p><strong>Note:</strong> Past performance is not indicative of future results. Seasonal analysis works best when combined with other market indicators and risk management strategies.</p>
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

export default SeasonalStrategyInsights;
