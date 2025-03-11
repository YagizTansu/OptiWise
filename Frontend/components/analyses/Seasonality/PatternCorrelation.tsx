import { useState, useEffect } from 'react';
import { FaQuestion, FaChartLine, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PatternCorrelationProps {
  symbol: string;
}

interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

const PatternCorrelation: React.FC<PatternCorrelationProps> = ({ symbol }) => {
  // Internal state management
  const [comparisonPeriods, setComparisonPeriods] = useState({ first: '3 Years', second: '5 Years' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [correlationData, setCorrelationData] = useState({
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

  // Helper function to convert period strings to milliseconds
  const periodToMs = (period: string): number => {
    const value = parseInt(period);
    if (period.includes('Year')) {
      return value * 365 * 24 * 60 * 60 * 1000;
    }
    return 365 * 24 * 60 * 60 * 1000; // default to 1 year
  };

  // Calculate correlation between two datasets
  const calculateCorrelation = (dataset1: number[], dataset2: number[]): number => {
    if (dataset1.length === 0 || dataset2.length === 0) return 0;
    
    // Ensure datasets are the same length by using the smaller one
    const length = Math.min(dataset1.length, dataset2.length);
    dataset1 = dataset1.slice(0, length);
    dataset2 = dataset2.slice(0, length);
    
    // Calculate mean
    const mean1 = dataset1.reduce((sum, val) => sum + val, 0) / length;
    const mean2 = dataset2.reduce((sum, val) => sum + val, 0) / length;
    
    // Calculate correlation coefficient
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    for (let i = 0; i < length; i++) {
      const diff1 = dataset1[i] - mean1;
      const diff2 = dataset2[i] - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }
    
    if (denominator1 === 0 || denominator2 === 0) return 0;
    
    return numerator / Math.sqrt(denominator1 * denominator2);
  };

  // Determine correlation strength as text with added emoji for visual indicator
  const getCorrelationStrength = (coefficient: number): string => {
    const absCoefficient = Math.abs(coefficient);
    if (absCoefficient > 0.7) return 'Strong';
    if (absCoefficient > 0.5) return 'Moderate';
    if (absCoefficient > 0.3) return 'Weak';
    return 'Very Weak';
  };

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

  // Calculate reliability score based on data size and correlation strength
  const calculateReliabilityScore = (coefficient: number, dataSize: number): number => {
    const baseScore = Math.abs(coefficient) * 100;
    // Adjust based on data size (more data = more reliable)
    const dataSizeFactor = Math.min(1, dataSize / 250); // 250 days (~1 trading year) is considered full reliability
    return Math.round(baseScore * (0.7 + 0.3 * dataSizeFactor));
  };

  // Fetch historical data and calculate correlation
  const fetchDataAndCalculateCorrelation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentDate = new Date();
      
      // Calculate date ranges based on selected periods
      const firstPeriodMs = periodToMs(comparisonPeriods.first);
      const secondPeriodMs = periodToMs(comparisonPeriods.second);
      
      // First period
      const firstPeriodStart = new Date(currentDate.getTime() - firstPeriodMs).toISOString();
      
      // Second period
      const secondPeriodStart = new Date(currentDate.getTime() - secondPeriodMs).toISOString();
      
      const currentDateString = currentDate.toISOString();
      
      // Make API calls to get historical data
      const [firstPeriodResponse, secondPeriodResponse] = await Promise.all([
        axios.get(`http://localhost:3001/api/finance/historical`, {
          params: {
            symbol,
            from: firstPeriodStart,
            to: currentDateString,
            interval: '1d'
          }
        }),
        axios.get(`http://localhost:3001/api/finance/historical`, {
          params: {
            symbol,
            from: secondPeriodStart,
            to: currentDateString,
            interval: '1d'
          }
        })
      ]);
      
      // Extract closing prices for correlation calculation
      const firstPeriodPrices = firstPeriodResponse.data.map((item: HistoricalData) => item.close);
      const secondPeriodPrices = secondPeriodResponse.data.map((item: HistoricalData) => item.close);
      
      // Calculate correlation coefficient
      const coefficient = calculateCorrelation(firstPeriodPrices, secondPeriodPrices);
      const correlationPercentage = Math.abs(coefficient) * 100;
      
      // Determine strength and reliability
      const strength = getCorrelationStrength(coefficient);
      const reliabilityScore = calculateReliabilityScore(coefficient, Math.min(firstPeriodPrices.length, secondPeriodPrices.length));
      
      // Get the correlation color for visual feedback
      const correlationColor = getCorrelationColor(coefficient);
      
      // Update state with calculated values
      setCorrelationData({
        coefficient: parseFloat(coefficient.toFixed(2)),
        strength,
        reliabilityScore,
        chartData: {
          labels: ['Correlation', 'No Correlation'],
          datasets: [
            {
              data: [correlationPercentage, 100 - correlationPercentage],
              backgroundColor: [
                correlationColor,
                'rgba(230, 230, 230, 0.5)'
              ],
              borderWidth: 0,
              cutout: '75%'
            }
          ]
        }
      });
      
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
        <h2><FaChartLine className={styles.headerIcon} /> Pattern Correlation</h2>
        <div className={styles.infoIconContainer}>
          <FaInfoCircle className={styles.infoIcon} title="Compare historical price patterns across different time periods" />
        </div>
      </div>
      
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
                  <span className={styles.correlationDirection}>
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
                    {correlationData.coefficient} ({correlationData.coefficient > 0 ? 'Positive' : 'Negative'})
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
                {correlationData.coefficient}
              </p>
              <p className={styles.statDescription}>
                {correlationData.coefficient > 0 ? 'Positive correlation' : 'Negative correlation'}
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
                {correlationData.strength === 'Strong' ? 'Consistent patterns' : 'Variable patterns'}
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
              <p className={styles.statDescription}>Based on historical data</p>
            </div>
          </div>
          
          <div className={styles.insightContainer}>
            <div className={styles.insightHeader}>
              <FaInfoCircle /> Pattern Insight
            </div>
            <p className={styles.insightText}>
              {correlationData.coefficient > 0.7 ? 
                `Strong positive correlation suggests ${symbol} exhibits similar price movements across these time periods. Past patterns may be useful for future predictions.` :
                correlationData.coefficient < -0.7 ?
                `Strong negative correlation indicates ${symbol} tends to move in opposite directions when comparing these time periods.` :
                Math.abs(correlationData.coefficient) > 0.3 ?
                `Moderate correlation detected. ${symbol} shows some consistent patterns, but with notable variations between periods.` :
                `Weak correlation indicates ${symbol} doesn't exhibit consistent patterns between these time periods. Consider analyzing different intervals.`
              }
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PatternCorrelation;
