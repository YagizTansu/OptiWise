import React from 'react';
import { FaArrowUp, FaArrowDown, FaArrowRight } from 'react-icons/fa';
import styles from '../../../styles/ForecastAI.module.css';

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
  );
};

export default PricePredictionDashboard;
