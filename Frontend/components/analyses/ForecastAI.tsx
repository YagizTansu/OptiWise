import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown, FaArrowRight, FaQuestion, FaChartLine, FaBell, FaHistory, FaExchangeAlt, FaSpinner } from 'react-icons/fa';
import styles from '../../styles/ForecastAI.module.css';
import technicalAnalysisAI, { TechnicalAnalysisResult } from '../../services/analysis/technicalAnalysisAI';

interface ForecastAIProps {
  symbol: string;
}

const ForecastAI: React.FC<ForecastAIProps> = ({ symbol }) => {
  // Component state
  const [timeframe, setTimeframe] = useState('daily');
  const [userQuestion, setUserQuestion] = useState('');
  const [showQA, setShowQA] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<TechnicalAnalysisResult | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  
  // Load analysis data when component mounts or symbol changes
  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get real analysis data from AI service
        const result = await technicalAnalysisAI.analyzeStock(symbol);
        debugger
        setAnalysisResult(result);
        
        // Update chart data based on current timeframe
        updateChartData(result, timeframe);
        
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to analyze ${symbol}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    loadAnalysis();
  }, [symbol]);
  
  // Update chart when timeframe changes
  useEffect(() => {
    if (analysisResult) {
      updateChartData(analysisResult, timeframe);
    }
  }, [timeframe, analysisResult]);
  
  // Function to update chart data based on timeframe
  const updateChartData = (result: TechnicalAnalysisResult, selectedTimeframe: string) => {
    if (!result) return;
    
    // Get the appropriate prediction value based on timeframe
    let predictionValue;
    switch (selectedTimeframe) {
      case 'daily':
        predictionValue = result.prediction.shortTerm.value;
        break;
      case 'weekly':
        predictionValue = result.prediction.midTerm.value;
        break;
      case 'monthly':
      case 'yearly':
        predictionValue = result.prediction.longTerm.value;
        break;
      default:
        predictionValue = result.prediction.shortTerm.value;
    }
    
    // Get current price from chart data
    const currentPrice = result.chartData.datasets[0].data[0];
    
    // Generate new forecast data for selected timeframe
    const newChartData = technicalAnalysisAI.generateChartForecastData(
      currentPrice,
      predictionValue,
      selectedTimeframe
    );
    
    setChartData(newChartData);
  };
  
  // Handle user questions about the stock
  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    try {
      setIsAnswerLoading(true);
      setShowQA(true);
      
      // Get AI response to user question
      const response = await technicalAnalysisAI.answerStockQuestion(symbol, userQuestion);
      setAnswer(response);
      
      setIsAnswerLoading(false);
    } catch (err) {
      setAnswer(`Sorry, I couldn't answer that question right now. Please try again later.`);
      setIsAnswerLoading(false);
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
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Analyzing {symbol} with AI...</p>
      </div>
    );
  }
  
  // Show error state
  if (error || !analysisResult) {
    return (
      <div className={styles.errorContainer}>
        <h3>Analysis Error</h3>
        <p>{error || 'Failed to generate analysis. Please try again.'}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  // Destructure analysis result for easier access
  const { prediction, analysis, probabilityData, technicalFactors, accuracyData } = analysisResult;
  
  // Default summary if empty
  const summaryText = analysis.summary?.trim() || 
    `Based on our analysis, ${symbol} is showing a ${prediction.trendIndicator === 'up' ? 'bullish' : 
    prediction.trendIndicator === 'down' ? 'bearish' : 'neutral'} trend with key support at $${prediction.supportLevels[0]} 
    and resistance at $${prediction.resistanceLevels[0]}. Short-term prediction is ${prediction.shortTerm.value} 
    with ${prediction.shortTerm.confidence}% confidence.`;
  
  // Ensure sentiment data is valid
  const sentimentData = technicalFactors.sentiment && 
    Object.keys(technicalFactors.sentiment).filter(key => !key.includes('**')).length > 0 ? 
    technicalFactors.sentiment : 
    { 
      "Market Sentiment": "Neutral",
      "Social Media Buzz": "Moderate",
      "News Impact": "Mixed" 
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
            <div className={styles.predictionValue}>{prediction.shortTerm.value}</div>
            <div className={styles.confidenceBar}>
              <div 
                className={styles.confidenceFill} 
                style={{ width: `${prediction.shortTerm.confidence}%` }}
              ></div>
            </div>
            <div className={styles.confidenceLabel}>{prediction.shortTerm.confidence}% Confidence</div>
          </div>
          
          <div className={styles.predictionCard}>
            <h4>Mid Term (30d)</h4>
            <div className={styles.predictionValue}>{prediction.midTerm.value}</div>
            <div className={styles.confidenceBar}>
              <div 
                className={styles.confidenceFill} 
                style={{ width: `${prediction.midTerm.confidence}%` }}
              ></div>
            </div>
            <div className={styles.confidenceLabel}>{prediction.midTerm.confidence}% Confidence</div>
          </div>
          
          <div className={styles.predictionCard}>
            <h4>Long Term (90d)</h4>
            <div className={styles.predictionValue}>{prediction.longTerm.value}</div>
            <div className={styles.confidenceBar}>
              <div 
                className={styles.confidenceFill} 
                style={{ width: `${prediction.longTerm.confidence}%` }}
              ></div>
            </div>
            <div className={styles.confidenceLabel}>{prediction.longTerm.confidence}% Confidence</div>
          </div>
          
          <div className={styles.predictionCard}>
            <h4>Trend Indicator</h4>
            <div className={styles.trendIndicator}>
              {renderTrendIndicator(prediction.trendIndicator)}
            </div>
            <div className={styles.trendLabel}>
              {prediction.trendIndicator === 'up' ? 'Bullish' : 
               prediction.trendIndicator === 'down' ? 'Bearish' : 'Neutral'}
            </div>
          </div>
        </div>
      </div>
      
      {/* 2. Smart Analysis Summary */}
      <div className={styles.analysisSection}>
        <h3>Smart Analysis Summary</h3>
        <div className={styles.analysisSummary}>
          <p className={styles.summaryText}>
            {summaryText}
          </p>
          
          <div className={styles.keyFindings}>
            <h4>Key Findings</h4>
            <ul>
              {analysis.keyFindings && analysis.keyFindings.length > 0 ? 
                analysis.keyFindings
                  .filter(finding => finding && !finding.includes('s/'))
                  .map((finding, index) => (
                    <li key={`finding-${index}`}>{finding}</li>
                  ))
                : 
                <li>No key findings available at this time.</li>
              }
            </ul>
          </div>
          
          <div className={styles.catalysts}>
            <h4>Potential Catalysts</h4>
            <ul>
              {analysis.catalysts && analysis.catalysts.length > 0 ?
                analysis.catalysts
                  .filter(catalyst => catalyst && !catalyst.includes('s/'))
                  .map((catalyst, index) => (
                    <li key={`catalyst-${index}`}>{catalyst}</li>
                  ))
                :
                <li>No potential catalysts identified at this time.</li>
              }
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
            data={chartData || analysisResult.chartData}
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
              {prediction.resistanceLevels.map((level, index) => (
                <li key={`resistance-${index}`}>${level}</li>
              ))}
            </ul>
          </div>
          <div className={styles.levelGroup}>
            <h4>Support Levels</h4>
            <ul>
              {prediction.supportLevels.map((level, index) => (
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
              {Object.entries(technicalFactors.technical || {}).map(([key, value], index) => (
                <li key={`tech-${index}`}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>
          
          <div className={styles.factorCard}>
            <h4>Fundamental Factors</h4>
            <ul>
              {Object.entries(technicalFactors.fundamental || {}).map(([key, value], index) => (
                <li key={`fund-${index}`}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>
          
          <div className={styles.factorCard}>
            <h4>Market Sentiment</h4>
            <ul>
              {Object.entries(sentimentData).map(([key, value], index) => (
                <li key={`sent-${index}`}><strong>{key}:</strong> {value}</li>
              ))}
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
              onClick={handleAskQuestion}
              disabled={isAnswerLoading}
            >
              {isAnswerLoading ? <FaSpinner className={styles.spinnerSmall} /> : <FaQuestion />} Ask
            </button>
          </div>
          
          {showQA && (
            <div className={styles.qaResult}>
              <h5>Q: {userQuestion}</h5>
              <p>{isAnswerLoading ? 'Analyzing...' : answer}</p>
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
              defaultValue={prediction.resistanceLevels[0]}
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
                <td>${chartData ? chartData.datasets[0].data[0].toFixed(2) : "N/A"}</td>
                <td className={parseFloat(prediction.shortTerm.value) > 0 ? styles.positive : styles.negative}>
                  {prediction.shortTerm.value}
                </td>
                <td>{prediction.shortTerm.confidence}%</td>
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
