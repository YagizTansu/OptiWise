import { useState, useEffect } from 'react';
import { FaQuestion, FaChartLine, FaExchangeAlt, FaInfoCircle, FaTimes, FaLightbulb } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import styles from '../../../styles/seasonality/PatternCorrelation.module.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { fetchPatternCorrelation, PatternCorrelationData } from '../../../services/api/finance';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PatternCorrelationProps {
  symbol: string;
}

const PatternCorrelation: React.FC<PatternCorrelationProps> = ({ symbol }) => {
  // Internal state management
  const [comparisonPeriods, setComparisonPeriods] = useState({ first: '3 Years', second: '5 Years' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add state for modal visibility
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [correlationData, setCorrelationData] = useState<PatternCorrelationData>({
    coefficient: 0,
    strength: 'N/A',
    reliabilityScore: 0,
    chartData: {
      labels: ['Correlation', 'No Correlation'],
      datasets: [
        {
          data: [0, 100],
          backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(230, 230, 230, 0.5)'],
          borderWidth: 0,
          cutout: '75%'
        }
      ]
    }
  });

  // Get emoji based on correlation strength
  const getCorrelationEmoji = (strength: string): string => {
    switch(strength) {
      case 'Strong': return '🔥';
      case 'Moderate': return '⚡';
      case 'Weak': return '🔄';
      default: return '❄️';
    }
  };

  // Get color based on correlation value
  const getCorrelationColor = (coefficient: number): string => {
    const absValue = Math.abs(coefficient);
    if (absValue > 0.7) return '#20a0b8';  // Strong - teal
    if (absValue > 0.5) return '#5e88fc';  // Moderate - blue
    if (absValue > 0.3) return '#ba68c8';  // Weak - purple
    return '#9e9e9e';  // Very Weak - gray
  };

  // Fix: Add function to get correlation direction text
  const getCorrelationDirection = (coefficient: number): string => {
    if (coefficient > 0) return 'Positive';
    if (coefficient < 0) return 'Negative';
    return 'Neutral';
  };

  // Fetch data and calculate correlation
  const fetchDataAndCalculateCorrelation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchPatternCorrelation(
        symbol,
        comparisonPeriods.first,
        comparisonPeriods.second
      );
      
      setCorrelationData(data);
    } catch (err) {
      console.error('Error fetching pattern correlation data:', err);
      setError('Failed to fetch historical data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or periods change
  useEffect(() => {
    fetchDataAndCalculateCorrelation();
  }, [symbol, comparisonPeriods.first, comparisonPeriods.second]);

  return (
    <div className={`${styles.patternCorrelationSection} ${styles.analysisCard}`}>
      <div className={styles.cardHeader}>
        <h2>Pattern Correlation</h2>
        <div className={styles.infoIconContainer}>
          <button 
            className={styles.modernIconButton} 
            title="Learn About Pattern Correlation"
            onClick={() => setShowInfoModal(true)}
          >
            <FaQuestion />
          </button>
        </div>
      </div>
      
      {/* Info Modal - Styled to match TimeAverageReturns */}
      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Understanding Pattern Correlation</h3>
              <button 
                className={styles.closeButton} 
                onClick={() => setShowInfoModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                Pattern correlation measures how similarly a stock's price patterns behave across different time periods.
                A high correlation coefficient (close to 1 or -1) indicates that patterns from one period closely match
                or inversely match patterns from another period.
              </p>
              
              <h4>How to interpret the results:</h4>
              <ul className={styles.infoList}>
                <li>
                  <strong>Correlation Coefficient:</strong> Ranges from -1 to +1. Positive values indicate similar patterns, 
                  negative values indicate inverse patterns.
                </li>
                <li>
                  <strong>Strength:</strong> Describes how powerful the correlation is between time periods:
                  <ul>
                    <li><span style={{color: '#20a0b8'}}>Strong (0.7-1.0)</span>: High level of pattern similarity</li>
                    <li><span style={{color: '#5e88fc'}}>Moderate (0.5-0.7)</span>: Noticeable pattern similarity</li>
                    <li><span style={{color: '#ba68c8'}}>Weak (0.3-0.5)</span>: Some pattern similarity</li>
                    <li><span style={{color: '#9e9e9e'}}>Very Weak (0.0-0.3)</span>: Little to no pattern similarity</li>
                  </ul>
                </li>
                <li>
                  <strong>Reliability:</strong> Indicates confidence level in the correlation based on available historical data 
                  volume and consistency.
                </li>
              </ul>
              
              <h4>Trading Implications:</h4>
              <p>
                Strong correlations may suggest that historical patterns could repeat in the future, potentially 
                providing insights for trading strategies. However, remember that past performance is not always 
                indicative of future results.
              </p>
              
              <h4>Understanding Negative Correlation:</h4>
              <p>
                A negative correlation (closer to -1) indicates that patterns from one period tend to move in the 
                opposite direction of patterns from another period. This can be just as valuable for prediction 
                as positive correlations.
              </p>
              
              <h4>Using the Pattern Correlation tool:</h4>
              <ul className={styles.infoList}>
                <li>
                  <strong>Compare Periods:</strong> Select two different time periods to analyze pattern similarities
                </li>
                <li>
                  <strong>Correlation Value:</strong> The central number shows the correlation coefficient
                </li>
                <li>
                  <strong>Donut Chart:</strong> Visually represents the strength of the correlation
                </li>
                <li>
                  <strong>Detailed Stats:</strong> Review additional metrics in the statistics section below the chart
                </li>
              </ul>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modernPrimaryButton}
                onClick={() => setShowInfoModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.periodSelectorContainer}>
        <div className={styles.periodSelector}>
          <label>Compare:</label>
          <div className={styles.selectorsGroup}>
            <select 
              value={comparisonPeriods.first}
              onChange={(e) => setComparisonPeriods({...comparisonPeriods, first: e.target.value})}
              className={styles.modernSelect}
            >
              <option value="1 Year">1 Year</option>
              <option value="3 Years">3 Years</option>
              <option value="5 Years">5 Years</option>
              <option value="10 Years">10 Years</option>
            </select>
            
            <FaExchangeAlt className={styles.exchangeIcon} />
            
            <select 
              value={comparisonPeriods.second}
              onChange={(e) => setComparisonPeriods({...comparisonPeriods, second: e.target.value})}
              className={styles.modernSelect}
            >
              <option value="1 Year">1 Year</option>
              <option value="3 Years">3 Years</option>
              <option value="5 Years">5 Years</option>
              <option value="10 Years">10 Years</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Analyzing pattern correlations...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={fetchDataAndCalculateCorrelation}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className={styles.correlationFlexContainer}>
            <div className={styles.correlationChartSection}>
              <div className={styles.chartContainerSmall}>
                <Doughnut 
                  data={correlationData.chartData} 
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${typeof value === 'number' ? value.toFixed(1) : value}%`;
                          }
                        }
                      },
                      legend: {
                        display: false
                      }
                    },
                    animation: {
                      animateRotate: true,
                      animateScale: true
                    },
                    responsive: true,
                    maintainAspectRatio: true
                  }}
                />
                <div className={styles.chartCenterText}>
                  <span className={styles.correlationValue}>
                    {Math.abs(correlationData.coefficient).toFixed(2)}
                  </span>
                  <span className={styles.correlationDirection} style={{ color: correlationData.coefficient < 0 ? '#f44336' : '#4caf50' }}>
                    {correlationData.coefficient >= 0 ? '+' : '-'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.correlationInfoSection}>
              <h3 className={styles.correlationInfoTitle}>
                Pattern Correlation Analysis
              </h3>
              <p className={styles.analysisDescription}>
                Comparing <span className={styles.periodHighlight}>{comparisonPeriods.first}</span> vs <span className={styles.periodHighlight}>{comparisonPeriods.second}</span> for <strong>{symbol}</strong>
              </p>
              
              <div className={styles.correlationQuickStats}>
                <div className={styles.quickStatItem}>
                  <span className={styles.quickStatLabel}>Correlation:</span>
                  <span className={styles.quickStatValue} style={{ color: getCorrelationColor(correlationData.coefficient) }}>
                    {correlationData.coefficient.toFixed(2)} ({getCorrelationDirection(correlationData.coefficient)})
                  </span>
                </div>
                <div className={styles.quickStatItem}>
                  <span className={styles.quickStatLabel}>Strength:</span>
                  <span className={styles.quickStatValue} style={{ color: getCorrelationColor(correlationData.coefficient) }}>
                    {correlationData.strength} {getCorrelationEmoji(correlationData.strength)}
                  </span>
                </div>
                <div className={styles.quickStatItem}>
                  <span className={styles.quickStatLabel}>Reliability:</span>
                  <span className={styles.quickStatValue}>{correlationData.reliabilityScore}%</span>
                  <div className={styles.miniReliabilityBar}>
                    <div 
                      className={styles.miniReliabilityFill}
                      style={{ width: `${correlationData.reliabilityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.correlationStats}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <h3>Correlation</h3>
              </div>
              <p className={styles.statValue} style={{ color: getCorrelationColor(correlationData.coefficient) }}>
                {correlationData.coefficient.toFixed(2)}
              </p>
              <p className={styles.statDescription}>
                {correlationData.coefficient > 0 
                  ? 'Positive correlation (patterns move similarly)' 
                  : correlationData.coefficient < 0 
                    ? 'Negative correlation (patterns move inversely)' 
                    : 'No correlation detected'}
              </p>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <h3>Pattern Strength</h3>
              </div>
              <p className={styles.statValue} style={{ color: getCorrelationColor(correlationData.coefficient) }}>
                {correlationData.strength} {getCorrelationEmoji(correlationData.strength)}
              </p>
              <p className={styles.statDescription}>
                {correlationData.strength === 'Strong' ? 'Highly consistent relationship' : 'Variable relationship'}
              </p>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <h3>Reliability</h3>
              </div>
              <p className={styles.statValue}>
                {correlationData.reliabilityScore}%
              </p>
              <div className={styles.reliabilityBar}>
                <div 
                  className={styles.reliabilityFill}
                  style={{ width: `${correlationData.reliabilityScore}%` }}
                ></div>
              </div>
              <p className={styles.statDescription}>Based on historical data quality</p>
            </div>
          </div>
          
          <div className={styles.insightContainer}>
            <div className={styles.insightHeader}>
              <FaLightbulb /> Pattern Insight
            </div>
            <p className={styles.insightText}>
              {Math.abs(correlationData.coefficient) > 0.7 && correlationData.coefficient > 0 ? 
                `Strong positive correlation suggests ${symbol} exhibits similar price movements across these time periods. Past patterns may be useful for future predictions.` :
                Math.abs(correlationData.coefficient) > 0.7 && correlationData.coefficient < 0 ?
                `Strong negative correlation indicates ${symbol} tends to move in opposite directions when comparing these time periods. When one period shows an uptrend, the other typically shows a downtrend.` :
                Math.abs(correlationData.coefficient) > 0.5 && correlationData.coefficient > 0 ?
                `Moderate positive correlation detected. ${symbol} shows noticeable pattern similarities between periods, though with some variations.` :
                Math.abs(correlationData.coefficient) > 0.5 && correlationData.coefficient < 0 ?
                `Moderate negative correlation detected. ${symbol} shows noticeable inverse patterns between periods.` :
                Math.abs(correlationData.coefficient) > 0.3 ?
                `Weak correlation detected. ${symbol} shows some relationship between periods, but with significant variations.` :
                `Very weak or no correlation indicates ${symbol} doesn't exhibit consistent pattern relationships between these time periods. Consider analyzing different intervals.`
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PatternCorrelation;
