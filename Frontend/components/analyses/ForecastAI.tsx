import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown, FaArrowRight, FaQuestion, FaChartLine, FaBell, FaHistory, FaExchangeAlt } from 'react-icons/fa';
import styles from '../../styles/ForecastAI.module.css';

interface ForecastAIProps {
  symbol: string;
}

const ForecastAI: React.FC<ForecastAIProps> = ({ symbol }) => {
  const [timeframe, setTimeframe] = useState('daily');
  const [userQuestion, setUserQuestion] = useState('');
  const [showQA, setShowQA] = useState(false);
  
  // Mock data - in a real application, this would come from an API
  const predictionData = {
    shortTerm: { value: '+2.4%', confidence: 87 },
    midTerm: { value: '+8.1%', confidence: 74 },
    longTerm: { value: '+15.3%', confidence: 61 },
    trendIndicator: 'up', // 'up', 'down', or 'sideways'
    supportLevels: [185.2, 178.5, 172.3],
    resistanceLevels: [198.7, 205.3, 213.8]
  };
  
  // Mock chart data
  const chartData = {
    labels: ['Now', '+1D', '+2D', '+3D', '+4D', '+5D', '+6D', '+7D'],
    datasets: [
      {
        label: 'Predicted Price',
        data: [190, 192, 195, 193, 197, 201, 203, 205],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Upper Range',
        data: [190, 194, 198, 197, 202, 207, 210, 213],
        borderColor: 'rgba(75, 192, 192, 0.5)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
      },
      {
        label: 'Lower Range',
        data: [190, 189, 192, 190, 193, 197, 198, 200],
        borderColor: 'rgba(75, 192, 192, 0.5)',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
      },
    ],
  };

  // Mock probability distribution data
  const probabilityData = {
    labels: ['-5%', '-2.5%', '0%', '+2.5%', '+5%', '+7.5%', '+10%'],
    datasets: [
      {
        label: 'Probability',
        data: [5, 10, 15, 30, 25, 10, 5],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Mock accuracy data
  const accuracyData = {
    overall: 78,
    byTimeframe: {
      daily: 82,
      weekly: 76,
      monthly: 71,
      yearly: 65,
    }
  };
  
  // Render the trend indicator
  const renderTrendIndicator = (trend: string) => {
    switch(trend) {
      case 'up':
        return <FaArrowUp className={styles.trendUp} />;
      case 'down':
        return <FaArrowDown className={styles.trendDown} />;
      default:
        return <FaArrowRight className={styles.trendSideways} />;
    }
  };
  
  return (
    <div className={styles.forecastContainer}>
      <div className={styles.sectionTitle}>
        <h2>AI Forecast for {symbol}</h2>
      </div>
      
      {/* 1. Prediction Dashboard */}
      <div className={styles.dashboardSection}>
        <h3>Price Prediction Dashboard</h3>
        <div className={styles.predictionCards}>
          <div className={styles.predictionCard}>
            <h4>Short Term (7d)</h4>
            <div className={styles.predictionValue}>{predictionData.shortTerm.value}</div>
            <div className={styles.confidenceBar}>
              <div 
                className={styles.confidenceFill} 
                style={{ width: `${predictionData.shortTerm.confidence}%` }}
              ></div>
            </div>
            <div className={styles.confidenceLabel}>{predictionData.shortTerm.confidence}% Confidence</div>
          </div>
          
          <div className={styles.predictionCard}>
            <h4>Mid Term (30d)</h4>
            <div className={styles.predictionValue}>{predictionData.midTerm.value}</div>
            <div className={styles.confidenceBar}>
              <div 
                className={styles.confidenceFill} 
                style={{ width: `${predictionData.midTerm.confidence}%` }}
              ></div>
            </div>
            <div className={styles.confidenceLabel}>{predictionData.midTerm.confidence}% Confidence</div>
          </div>
          
          <div className={styles.predictionCard}>
            <h4>Long Term (90d)</h4>
            <div className={styles.predictionValue}>{predictionData.longTerm.value}</div>
            <div className={styles.confidenceBar}>
              <div 
                className={styles.confidenceFill} 
                style={{ width: `${predictionData.longTerm.confidence}%` }}
              ></div>
            </div>
            <div className={styles.confidenceLabel}>{predictionData.longTerm.confidence}% Confidence</div>
          </div>
          
          <div className={styles.predictionCard}>
            <h4>Trend Indicator</h4>
            <div className={styles.trendIndicator}>
              {renderTrendIndicator(predictionData.trendIndicator)}
            </div>
            <div className={styles.trendLabel}>
              {predictionData.trendIndicator === 'up' ? 'Bullish' : 
               predictionData.trendIndicator === 'down' ? 'Bearish' : 'Neutral'}
            </div>
          </div>
        </div>
      </div>
      
      {/* 2. Smart Analysis Summary */}
      <div className={styles.analysisSection}>
        <h3>Smart Analysis Summary</h3>
        <div className={styles.analysisSummary}>
          <p className={styles.summaryText}>
            {symbol} is showing strong bullish momentum with increasing volume and institutional interest. 
            Technical indicators suggest potential breakout above $195 resistance, with fundamental factors 
            providing additional support.
          </p>
          
          <div className={styles.keyFindings}>
            <h4>Key Findings</h4>
            <ul>
              <li>RSI indicates momentum without being overbought</li>
              <li>Positive reversal pattern forming on daily chart</li>
              <li>Above major moving averages (20, 50, 200 EMA)</li>
              <li>Increased institutional buying activity</li>
            </ul>
          </div>
          
          <div className={styles.catalysts}>
            <h4>Potential Catalysts</h4>
            <ul>
              <li>Upcoming earnings announcement (Est. Mar 15)</li>
              <li>New product launch expected in Q2</li>
              <li>Industry regulation changes anticipated</li>
              <li>Potential market segment expansion</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 3. Multi-Timeframe Predictions */}
      <div className={styles.timeframeSection}>
        <h3>Multi-Timeframe Predictions</h3>
        <div className={styles.timeframeSelector}>
          <button 
            className={`${styles.timeframeButton} ${timeframe === 'daily' ? styles.activeTimeframe : ''}`}
            onClick={() => setTimeframe('daily')}
          >
            Daily
          </button>
          <button 
            className={`${styles.timeframeButton} ${timeframe === 'weekly' ? styles.activeTimeframe : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`${styles.timeframeButton} ${timeframe === 'monthly' ? styles.activeTimeframe : ''}`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`${styles.timeframeButton} ${timeframe === 'yearly' ? styles.activeTimeframe : ''}`}
            onClick={() => setTimeframe('yearly')}
          >
            Yearly
          </button>
        </div>
        
        <div className={styles.chartContainer}>
          <Line 
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Price Forecast`,
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                }
              }
            }}
          />
        </div>
        
        <div className={styles.levelsContainer}>
          <div className={styles.levelGroup}>
            <h4>Resistance Levels</h4>
            <ul>
              {predictionData.resistanceLevels.map((level, index) => (
                <li key={`resistance-${index}`}>${level}</li>
              ))}
            </ul>
          </div>
          <div className={styles.levelGroup}>
            <h4>Support Levels</h4>
            <ul>
              {predictionData.supportLevels.map((level, index) => (
                <li key={`support-${index}`}>${level}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className={styles.probabilityContainer}>
          <h4>Price Probability Distribution</h4>
          <Bar
            data={probabilityData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: true,
                  text: 'Probability Distribution by Price Change',
                },
              },
            }}
          />
        </div>
      </div>
      
      {/* 4. Detailed Analysis Rationale */}
      <div className={styles.rationaleSection}>
        <h3>Analysis Rationale</h3>
        <div className={styles.factorsGrid}>
          <div className={styles.factorCard}>
            <h4>Technical Factors</h4>
            <ul>
              <li><strong>RSI:</strong> 62 (Moderately bullish)</li>
              <li><strong>MACD:</strong> Positive crossover</li>
              <li><strong>Moving Averages:</strong> Above 20, 50, 200 EMAs</li>
              <li><strong>Volume:</strong> Above average accumulation</li>
              <li><strong>Chart Patterns:</strong> Inverted head & shoulders</li>
            </ul>
          </div>
          
          <div className={styles.factorCard}>
            <h4>Fundamental Factors</h4>
            <ul>
              <li><strong>Earnings Growth:</strong> +12% YoY</li>
              <li><strong>Revenue Growth:</strong> +8.5% YoY</li>
              <li><strong>P/E Ratio:</strong> 24.3 (Industry avg: 27.8)</li>
              <li><strong>Debt/Equity:</strong> 0.32 (Healthy)</li>
              <li><strong>Cash Reserves:</strong> Increasing</li>
            </ul>
          </div>
          
          <div className={styles.factorCard}>
            <h4>Market Sentiment</h4>
            <ul>
              <li><strong>News Sentiment:</strong> 78% positive</li>
              <li><strong>Social Media:</strong> Moderately bullish</li>
              <li><strong>Analyst Ratings:</strong> 14 Buy, 7 Hold, 2 Sell</li>
              <li><strong>Options Put/Call Ratio:</strong> 0.72 (Bullish)</li>
              <li><strong>Insider Activity:</strong> Net buying</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 5. Interactive Features */}
      <div className={styles.interactiveSection}>
        <h3>Interactive Features</h3>
        
        <div className={styles.qaSection}>
          <h4>Ask AI About {symbol}</h4>
          <div className={styles.questionForm}>
            <input
              type="text"
              placeholder="Ask a question about this asset..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              className={styles.questionInput}
            />
            <button 
              className={styles.askButton}
              onClick={() => setShowQA(true)}
            >
              <FaQuestion /> Ask
            </button>
          </div>
          
          {showQA && (
            <div className={styles.qaResult}>
              <h5>Q: {userQuestion || "What are the key resistance levels for this asset?"}</h5>
              <p>
                Based on my analysis of {symbol}, the key resistance levels to watch are $198.70, 
                $205.30, and $213.80. The most significant of these is $198.70, which has been tested 
                three times in the past month. A breakthrough above this level with strong volume would 
                likely trigger a move toward the $205.30 level.
              </p>
            </div>
          )}
        </div>
        
        <div className={styles.alertsSection}>
          <h4>Price Alerts</h4>
          <div className={styles.alertForm}>
            <select className={styles.alertType}>
              <option>Price goes above</option>
              <option>Price goes below</option>
              <option>Daily change exceeds</option>
              <option>Volume exceeds</option>
            </select>
            <input 
              type="number" 
              placeholder="Value" 
              className={styles.alertValue}
              defaultValue={195.00}
            />
            <button className={styles.setAlertButton}>
              <FaBell /> Set Alert
            </button>
          </div>
        </div>
      </div>
      
      {/* 6. Historical Prediction Accuracy */}
      <div className={styles.accuracySection}>
        <h3>Historical Prediction Accuracy</h3>
        <div className={styles.accuracyOverview}>
          <div className={styles.accuracyCircle}>
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4caf50"
                strokeWidth="3"
                strokeDasharray={`${accuracyData.overall}, 100`}
              />
              <text x="18" y="21" className={styles.accuracyText}>
                {accuracyData.overall}%
              </text>
            </svg>
            <div>Overall Accuracy</div>
          </div>
          
          <div className={styles.accuracyDetails}>
            <div className={styles.accuracyItem}>
              <span>Daily Forecast:</span>
              <div className={styles.accuracyBar}>
                <div style={{ width: `${accuracyData.byTimeframe.daily}%` }}></div>
              </div>
              <span>{accuracyData.byTimeframe.daily}%</span>
            </div>
            <div className={styles.accuracyItem}>
              <span>Weekly Forecast:</span>
              <div className={styles.accuracyBar}>
                <div style={{ width: `${accuracyData.byTimeframe.weekly}%` }}></div>
              </div>
              <span>{accuracyData.byTimeframe.weekly}%</span>
            </div>
            <div className={styles.accuracyItem}>
              <span>Monthly Forecast:</span>
              <div className={styles.accuracyBar}>
                <div style={{ width: `${accuracyData.byTimeframe.monthly}%` }}></div>
              </div>
              <span>{accuracyData.byTimeframe.monthly}%</span>
            </div>
            <div className={styles.accuracyItem}>
              <span>Yearly Forecast:</span>
              <div className={styles.accuracyBar}>
                <div style={{ width: `${accuracyData.byTimeframe.yearly}%` }}></div>
              </div>
              <span>{accuracyData.byTimeframe.yearly}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 7. Comparative Analysis */}
      <div className={styles.comparativeSection}>
        <h3>Comparative Analysis</h3>
        <div className={styles.comparisonTabs}>
          <button className={`${styles.compTab} ${styles.activeCompTab}`}>Similar Assets</button>
          <button className={styles.compTab}>Correlations</button>
          <button className={styles.compTab}>Scenarios</button>
        </div>
        
        <div className={styles.similarAssets}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Current Price</th>
                <th>7d Forecast</th>
                <th>Confidence</th>
                <th>Compare</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{symbol}</td>
                <td>$190.25</td>
                <td className={styles.positive}>+2.4%</td>
                <td>87%</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Similar Asset 1</td>
                <td>$78.40</td>
                <td className={styles.positive}>+1.8%</td>
                <td>82%</td>
                <td><button className={styles.compareButton}><FaExchangeAlt /></button></td>
              </tr>
              <tr>
                <td>Similar Asset 2</td>
                <td>$134.90</td>
                <td className={styles.negative}>-0.5%</td>
                <td>75%</td>
                <td><button className={styles.compareButton}><FaExchangeAlt /></button></td>
              </tr>
              <tr>
                <td>Similar Asset 3</td>
                <td>$223.15</td>
                <td className={styles.positive}>+3.1%</td>
                <td>79%</td>
                <td><button className={styles.compareButton}><FaExchangeAlt /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForecastAI;
