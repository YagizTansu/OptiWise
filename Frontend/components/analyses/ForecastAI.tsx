import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import styles from '../../styles/ForecastAI.module.css';
import technicalAnalysisAI, { TechnicalAnalysisResult } from '../../services/analysis/technicalAnalysisAI';
import TechnicalAnalysis from './Report/TechnicalAnalysis';
import PricePredictionDashboard from './dashboard/PricePredictionDashboard';
import SmartAnalysisSummary from './dashboard/SmartAnalysisSummary';
import MultiTimeframePredictions from './dashboard/MultiTimeframePredictions';
import AnalysisRationale from './dashboard/AnalysisRationale';
import HistoricalAccuracy from './dashboard/HistoricalAccuracy';
import InteractiveFeatures from './dashboard/InteractiveFeatures';

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
      <PricePredictionDashboard prediction={prediction} symbol={symbol} />
      
      {/* 2. Smart Analysis Summary */}
      <SmartAnalysisSummary analysis={analysis} summaryText={summaryText} />

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
