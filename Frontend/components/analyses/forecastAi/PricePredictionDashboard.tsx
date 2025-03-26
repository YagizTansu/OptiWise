import React from 'react';
import { FaArrowUp, FaArrowDown, FaArrowRight } from 'react-icons/fa';
import styles from '../../../styles/forecastAi/PricePredictionDashboard.module.css';

interface PredictionData {
  shortTerm: {
    value: string;
    confidence: number;
  };
  midTerm: {
    value: string;
    confidence: number;
  };
  longTerm: {
    value: string;
    confidence: number;
  };
  trendIndicator: string;
}

interface PricePredictionDashboardProps {
  prediction: PredictionData;
  symbol: string;
}

const PricePredictionDashboard: React.FC<PricePredictionDashboardProps> = ({ prediction, symbol }) => {
  // Check if value is positive or negative
  const isPredictionPositive = (value: string) => {
    return value.includes('+');
  };
  
  const isPredictionNegative = (value: string) => {
    return value.includes('-');
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
    <div className={styles.dashboardSection}>
      <h3>Price Prediction Dashboard</h3>
      <div className={styles.predictionCards}>
        <div className={styles.predictionCard}>
          <h4>Short Term (7d)</h4>
          <div 
            className={styles.predictionValue}
            data-positive={isPredictionPositive(prediction.shortTerm.value)}
            data-negative={isPredictionNegative(prediction.shortTerm.value)}
          >
            {prediction.shortTerm.value}
          </div>
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
          <div 
            className={styles.predictionValue}
            data-positive={isPredictionPositive(prediction.midTerm.value)}
            data-negative={isPredictionNegative(prediction.midTerm.value)}
          >
            {prediction.midTerm.value}
          </div>
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
          <div 
            className={styles.predictionValue}
            data-positive={isPredictionPositive(prediction.longTerm.value)}
            data-negative={isPredictionNegative(prediction.longTerm.value)}
          >
            {prediction.longTerm.value}
          </div>
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
          <div 
            className={styles.trendLabel}
            data-trend={prediction.trendIndicator}
          >
            {prediction.trendIndicator === 'up' ? 'Bullish' : 
             prediction.trendIndicator === 'down' ? 'Bearish' : 'Neutral'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricePredictionDashboard;
