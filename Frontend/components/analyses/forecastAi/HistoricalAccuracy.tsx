import React from 'react';
import styles from '../../../styles/ForecastAI.module.css';

interface AccuracyData {
  overall: number;
  byTimeframe: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

interface HistoricalAccuracyProps {
  accuracyData: AccuracyData;
}

const HistoricalAccuracy: React.FC<HistoricalAccuracyProps> = ({ accuracyData }) => {
  return (
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
  );
};

export default HistoricalAccuracy;
