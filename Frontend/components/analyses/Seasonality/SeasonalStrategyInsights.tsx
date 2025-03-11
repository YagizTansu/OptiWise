import React from 'react';
import { FaChartLine, FaExclamationTriangle, FaRobot, FaArrowRight } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';

interface SeasonalStrategyInsightsProps {
  symbol: string;
}

const SeasonalStrategyInsights: React.FC<SeasonalStrategyInsightsProps> = ({ symbol }) => {
  return (
    <div className={styles.strategySuggestionsContainer}>
      <div className={styles.strategySuggestionsHeader}>
        <h2>Strategic Insights</h2>
        <p>Actionable trading opportunities based on historical seasonal patterns for {symbol}</p>
      </div>

      <div className={styles.strategyCards}>
        <div className={styles.strategyCard}>
          <div className={styles.cardIconContainer}>
            <FaChartLine className={styles.cardIcon} />
          </div>
          <h3>Strongest Pattern</h3>
          <div className={styles.cardContent}>
            <p>September to December shows a consistent uptrend pattern over 3 years.</p>
            <div className={styles.dataHighlight}>+15.3% cumulative</div>
            <button className={styles.modernPrimaryButton}>
              Explore Strategy <FaArrowRight className={styles.buttonIcon} />
            </button>
          </div>
        </div>

        <div className={styles.strategyCard}>
          <div className={styles.cardIconContainer}>
            <FaExclamationTriangle className={styles.cardIcon} />
          </div>
          <h3>Risk Pattern</h3>
          <div className={styles.cardContent}>
            <p>June historically shows consistent negative returns.</p>
            <div className={styles.dataHighlight}>-3.1% on average</div>
            <button className={styles.modernPrimaryButton}>
              Explore Strategy <FaArrowRight className={styles.buttonIcon} />
            </button>
          </div>
        </div>

        <div className={styles.strategyCard}>
          <div className={styles.cardIconContainer}>
            <FaRobot className={styles.cardIcon} />
          </div>
          <h3>AI Recommendation</h3>
          <div className={styles.cardContent}>
            <p>Consider stronger positions in March and rebalancing in November.</p>
            <div className={styles.dataHighlight}>+3.9% March | -2.1% November</div>
            <button className={styles.modernPrimaryButton}>
              AI Analysis <FaArrowRight className={styles.buttonIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalStrategyInsights;
