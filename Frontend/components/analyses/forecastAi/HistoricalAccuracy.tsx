import React, { useState } from 'react';
import styles from '../../../styles/forecastAi/ForecastAI.module.css';

// Custom Info icon component to replace react-feather dependency
const InfoIcon = ({ size = 16, className = '', onClick }: { size?: number, className?: string, onClick?: () => void }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Helper function to determine color based on accuracy value
  const getAccuracyColor = (value: number) => {
    if (value >= 85) return '#10b981'; // green for excellent
    if (value >= 70) return '#3b82f6'; // blue for good
    if (value >= 50) return '#f59e0b'; // amber for average
    return '#ef4444'; // red for poor
  };

  // Helper function to get accuracy label
  const getAccuracyLabel = (value: number) => {
    if (value >= 85) return 'Excellent';
    if (value >= 70) return 'Good';
    if (value >= 50) return 'Average';
    return 'Needs Improvement';
  };

  // Toggle tooltip display
  const toggleTooltip = (id: string) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  return (
    <div className={styles.accuracySection}>
      <h3>Historical Prediction Accuracy</h3>
      
      <div className={styles.summaryText} style={{ marginBottom: '1.5rem' }}>
        This section shows how accurately our AI has predicted similar market conditions in the past. 
        Higher accuracy suggests more reliable forecasts.
      </div>
      
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
              stroke={getAccuracyColor(accuracyData.overall)}
              strokeWidth="3"
              strokeDasharray={`${accuracyData.overall}, 100`}
            />
            <text x="18" y="19" className={styles.accuracyText}>
              {accuracyData.overall}%
            </text>
            <text x="18" y="24" className={styles.accuracyText} style={{ fontSize: '0.3rem' }}>
              {getAccuracyLabel(accuracyData.overall)}
            </text>
          </svg>
          <div style={{ marginTop: '0.5rem', fontWeight: 500 }}>Overall Accuracy</div>
          <div className={styles.tooltipContainer}>
            <InfoIcon 
              size={16} 
              className={styles.infoIcon} 
              onClick={() => toggleTooltip('overall')}
            />
            {activeTooltip === 'overall' && (
              <div className={styles.tooltipText}>
                The percentage of all historical predictions that fell within our margin of error. 
                Based on backtesting our model against real market outcomes.
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.accuracyDetails}>
          <div className={styles.accuracyItem}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Daily Forecast:</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon 
                  size={14} 
                  className={styles.infoIcon} 
                  onClick={() => toggleTooltip('daily')}
                />
                {activeTooltip === 'daily' && (
                  <div className={styles.tooltipText}>
                    How accurate our 24-hour predictions have been historically.
                    Short-term forecasts can be affected by sudden market events.
                  </div>
                )}
              </div>
            </div>
            <div className={styles.accuracyBar}>
              <div 
                style={{ 
                  width: `${accuracyData.byTimeframe.daily}%`,
                  background: getAccuracyColor(accuracyData.byTimeframe.daily)
                }}
              ></div>
            </div>
            <span style={{ color: getAccuracyColor(accuracyData.byTimeframe.daily) }}>
              {accuracyData.byTimeframe.daily}%
            </span>
          </div>
          
          <div className={styles.accuracyItem}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Weekly Forecast:</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon 
                  size={14} 
                  className={styles.infoIcon} 
                  onClick={() => toggleTooltip('weekly')}
                />
                {activeTooltip === 'weekly' && (
                  <div className={styles.tooltipText}>
                    How accurate our 7-day predictions have been historically.
                    Weekly forecasts balance short-term fluctuations with trend detection.
                  </div>
                )}
              </div>
            </div>
            <div className={styles.accuracyBar}>
              <div 
                style={{ 
                  width: `${accuracyData.byTimeframe.weekly}%`,
                  background: getAccuracyColor(accuracyData.byTimeframe.weekly)
                }}
              ></div>
            </div>
            <span style={{ color: getAccuracyColor(accuracyData.byTimeframe.weekly) }}>
              {accuracyData.byTimeframe.weekly}%
            </span>
          </div>
          
          <div className={styles.accuracyItem}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Monthly Forecast:</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon 
                  size={14} 
                  className={styles.infoIcon} 
                  onClick={() => toggleTooltip('monthly')}
                />
                {activeTooltip === 'monthly' && (
                  <div className={styles.tooltipText}>
                    How accurate our 30-day predictions have been historically.
                    Monthly forecasts capture medium-term market trends and cycles.
                  </div>
                )}
              </div>
            </div>
            <div className={styles.accuracyBar}>
              <div 
                style={{ 
                  width: `${accuracyData.byTimeframe.monthly}%`,
                  background: getAccuracyColor(accuracyData.byTimeframe.monthly)
                }}
              ></div>
            </div>
            <span style={{ color: getAccuracyColor(accuracyData.byTimeframe.monthly) }}>
              {accuracyData.byTimeframe.monthly}%
            </span>
          </div>
          
          <div className={styles.accuracyItem}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>Yearly Forecast:</span>
              <div className={styles.tooltipContainer}>
                <InfoIcon 
                  size={14} 
                  className={styles.infoIcon} 
                  onClick={() => toggleTooltip('yearly')}
                />
                {activeTooltip === 'yearly' && (
                  <div className={styles.tooltipText}>
                    How accurate our 365-day predictions have been historically.
                    Long-term forecasts focus on fundamental market drivers and major trends.
                  </div>
                )}
              </div>
            </div>
            <div className={styles.accuracyBar}>
              <div 
                style={{ 
                  width: `${accuracyData.byTimeframe.yearly}%`,
                  background: getAccuracyColor(accuracyData.byTimeframe.yearly)
                }}
              ></div>
            </div>
            <span style={{ color: getAccuracyColor(accuracyData.byTimeframe.yearly) }}>
              {accuracyData.byTimeframe.yearly}%
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.factorCard} style={{ marginTop: '1.5rem' }}>
        <h4>What These Numbers Mean</h4>
        <ul>
          <li>
            <strong>85%+ (Excellent):</strong> Very high confidence in predictions
          </li>
          <li>
            <strong>70-84% (Good):</strong> Reliable predictions with occasional variance
          </li>
          <li>
            <strong>50-69% (Average):</strong> Useful directional guidance but moderate precision
          </li>
          <li>
            <strong>Below 50% (Needs Improvement):</strong> Consider as supplementary information only
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HistoricalAccuracy;
