import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from '../../../styles/forecastAi/ForecastAI.module.css';
import technicalAnalysisAI, { TechnicalAnalysisResult } from '../../../services/analysis/technicalAnalysisAI';
import PricePredictionDashboard from './PricePredictionDashboard';
import SmartAnalysisSummary from './SmartAnalysisSummary';
import MultiTimeframePredictions from './MultiTimeframePredictions';
import AnalysisRationale from './AnalysisRationale';
import HistoricalAccuracy from './HistoricalAccuracy';
import InteractiveFeatures from './InteractiveFeatures';

interface ForecastAIProps {
  symbol: string;
}

const ForecastAI: React.FC<ForecastAIProps> = ({ symbol }) => {
  // Component state
  const [timeframe, setTimeframe] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<TechnicalAnalysisResult | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  
  // Load analysis data when component mounts or symbol changes
  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Comment out the API call
        const result = await technicalAnalysisAI.analyzeStock(symbol);
        
        // Use hardcoded test data instead
        // const result = {
        //   "prediction": {
        //     "shortTerm": {
        //       "value": "+2.4%",
        //       "confidence": 75
        //     },
        //     "midTerm": {
        //       "value": "+5.7%",
        //       "confidence": 65
        //     },
        //     "longTerm": {
        //       "value": "+10.2%",
        //       "confidence": 55
        //     },
        //     "trendIndicator": "sideways",
        //     "supportLevels": [
        //       206.31,
        //       199.93,
        //       191.42
        //     ],
        //     "resistanceLevels": [
        //       219.07,
        //       225.45,
        //       233.96
        //     ]
        //   },
        //   "analysis": {
        //     "summary": "",
        //     "keyFindings": [
        //       "Technical indicator 1 suggests monitoring price action.",
        //       "Technical indicator 2 suggests monitoring price action.",
        //       "Technical indicator 3 suggests monitoring price action.",
        //       "Technical indicator 4 suggests monitoring price action."
        //     ],
        //     "catalysts": [
        //       "s/",
        //       "Potential market movement factor 2.",
        //       "Potential market movement factor 3.",
        //       "Potential market movement factor 4."
        //     ]
        //   },
        //   "chartData": {
        //     "labels": [
        //       "Now",
        //       "+1D",
        //       "+2D",
        //       "+3D",
        //       "+4D",
        //       "+5D",
        //       "+6D",
        //       "+7D"
        //     ],
        //     "datasets": [
        //       {
        //         "label": "Predicted Price",
        //         "data": [
        //           212.69,
        //           213.41616306724546,
        //           214.14895661703915,
        //           214.87715583633835,
        //           215.60554394716274,
        //           216.3522292078796,
        //           217.07288846580693,
        //           217.80082641409032
        //         ],
        //         "borderColor": "rgba(75, 192, 192, 1)",
        //         "backgroundColor": "rgba(75, 192, 192, 0.2)",
        //         "fill": true
        //       },
        //       {
        //         "label": "Upper Range",
        //         "data": [
        //           212.69,
        //           213.56139568069455,
        //           214.44074794044695,
        //           215.314587003606,
        //           216.18865273659532,
        //           217.08467504945554,
        //           217.9494661589683,
        //           218.8229916969084
        //         ],
        //         "borderColor": "rgba(75, 192, 192, 0.5)",
        //         "backgroundColor": "transparent",
        //         "borderDash": [
        //           5,
        //           5
        //         ]
        //       },
        //       {
        //         "label": "Lower Range",
        //         "data": [
        //           212.69,
        //           213.27093045379635,
        //           213.8571652936313,
        //           214.43972466907064,
        //           215.0224351577302,
        //           215.61978336630366,
        //           216.19631077264552,
        //           216.7786611312723
        //         ],
        //         "borderColor": "rgba(75, 192, 192, 0.5)",
        //         "backgroundColor": "transparent",
        //         "borderDash": [
        //           5,
        //           5
        //         ]
        //       }
        //     ]
        //   },
        //   "probabilityData": {
        //     "labels": [
        //       "-5%",
        //       "-2.5%",
        //       "0%",
        //       "+2.5%",
        //       "+5%",
        //       "+7.5%",
        //       "+10%"
        //     ],
        //     "datasets": [
        //       {
        //         "label": "Probability",
        //         "data": [
        //           5,
        //           13,
        //           18,
        //           33,
        //           27,
        //           11,
        //           6
        //         ],
        //         "backgroundColor": "rgba(153, 102, 255, 0.6)",
        //         "borderColor": "rgba(153, 102, 255, 1)",
        //         "borderWidth": 1
        //       }
        //     ]
        //   },
        //   "technicalFactors": {
        //     "technical": {
        //       "RSI": "Moderate",
        //       "MACD": "Neutral",
        //       "Moving Averages": "Mixed signals",
        //       "Volume": "Average",
        //       "Chart Pattern": "Consolidation"
        //     },
        //     "fundamental": {
        //       "Earnings Growth": "Stable",
        //       "Revenue Growth": "In line with sector",
        //       "P/E Ratio": "Near industry average",
        //       "Debt/Equity": "Manageable",
        //       "Cash Reserves": "Adequate"
        //     },
        //     "sentiment": {
        //       "**Overall Sentiment**": "Cautiously bearish short term, neutral medium term. Institutional investors appear to be reassessing positions following the recent correction.",
        //       "**News Sentiment**": "Recent AI announcements at WWDC received mixed reception, contributing to the price volatility. Market appears to be in \"wait and see\" mode regarding Apple's AI integration strategy.",
        //       "**Analyst Consensus**": "The technical pattern suggests analysts are recalibrating price targets lower, with the current consolidation reflecting uncertainty about near term catalysts.",
        //       "**Options Market**": "Put/call ratio appears elevated based on price action, indicating hedging activity has increased. The options market is pricing in approximately 5 6% volatility through July expiration."
        //     }
        //   },
        //   "accuracyData": {
        //     "overall": 81,
        //     "byTimeframe": {
        //       "daily": 86,
        //       "weekly": 77,
        //       "monthly": 75,
        //       "yearly": 69
        //     }
        //   }
        // };
        
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
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Analyzing {symbol} with AI...</p>
        <div className={styles.loadingInfo}>
          <span>Processing market data</span>
          <div className={styles.loadingDots}>
            <span className={styles.loadingDot}></span>
            <span className={styles.loadingDot}></span>
            <span className={styles.loadingDot}></span>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !analysisResult) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIconContainer}>
            <svg className={styles.errorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 className={styles.errorTitle}>Analysis Error</h3>
          <p className={styles.errorMessage}>{error || 'Failed to generate analysis. Please try again.'}</p>
          <div className={styles.errorActions}>
            <button 
              className={styles.retryButton} 
              onClick={() => window.location.reload()}
            >
              <svg className={styles.retryIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7l3 2.7"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7l-3-2.7"></path>
              </svg>
              Retry Analysis
            </button>
            <a href="#" className={styles.supportLink}>Contact Support</a>
          </div>
          <div className={styles.errorTips}>
            <p>Tips:</p>
            <ul>
              <li>Check if the stock symbol is valid</li>
              <li>Verify your internet connection</li>
              <li>Our servers might be experiencing high demand</li>
            </ul>
          </div>
        </div>
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
      <PricePredictionDashboard prediction={prediction} symbol={symbol} />
      
      {/* 2. Smart Analysis Summary - Using the enhanced findings and catalysts */}
      <SmartAnalysisSummary 
        analysis={{
          summary: analysis.summary,
          keyFindings: analysis.keyFindings,
          catalysts: analysis.catalysts
        }} 
        summaryText={summaryText} 
      />

      {/* 4. Detailed Analysis Rationale */}
      <AnalysisRationale 
        technicalFactors={technicalFactors}
        sentimentData={sentimentData}
      />
      
      {/* 5. Interactive Features - Now managing its own state */}
      <InteractiveFeatures symbol={symbol} />
      
      {/* 3. Multi-Timeframe Predictions */}
      <MultiTimeframePredictions 
        chartData={chartData}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        prediction={prediction}
        probabilityData={probabilityData}
        analysisResult={analysisResult}
      />
      
      
      {/* 6. Historical Prediction Accuracy */}
      <HistoricalAccuracy accuracyData={accuracyData} />
    </div>
  );
};

export default ForecastAI;
