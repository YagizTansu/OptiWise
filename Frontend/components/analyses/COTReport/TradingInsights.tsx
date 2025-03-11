import React from 'react';
import styles from '../../../styles/Analyses.module.css';

interface TradingInsightsProps {
  symbol: string; // Add symbol
}

const TradingInsights: React.FC<TradingInsightsProps> = ({ symbol }) => {
  return (
    <div className={styles.strategySuggestions}>
      <h2>Trading Insights for {symbol}</h2>
      <div className={styles.strategyCards}>
        <div className={styles.strategyCard}>
          <h3>Contrarian Signal</h3>
          <p>Commercial traders increasing short positions may indicate overextended price. Consider partial profit taking.</p>
          <button className={styles.modernPrimaryButton}>Explore Strategy</button>
        </div>
        <div className={styles.strategyCard}>
          <h3>Historical Pattern</h3>
          <p>Current positioning ratio between large speculators and commercials matches Feb 2021 rally pattern.</p>
          <button className={styles.modernPrimaryButton}>View Pattern</button>
        </div>
        <div className={styles.strategyCard}>
          <h3>AI Recommendation</h3>
          <p>Position divergence suggests near-term volatility. Consider options strategies to capitalize on price swings.</p>
          <button className={styles.modernPrimaryButton}>AI Analysis</button>
        </div>
      </div>
    </div>
  );
};

export default TradingInsights;
