import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import styles from '../../../styles/forecastAi/ForecastAI.module.css';

interface MultiTimeframePredictionsProps {
  chartData: any;
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  prediction: {
    supportLevels: number[];
    resistanceLevels: number[];
  };
  probabilityData: any;
  analysisResult: any;
}

const MultiTimeframePredictions: React.FC<MultiTimeframePredictionsProps> = ({ 
  chartData, 
  timeframe, 
  setTimeframe, 
  prediction,
  probabilityData,
  analysisResult 
}) => {
  return (
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
  );
};

export default MultiTimeframePredictions;
