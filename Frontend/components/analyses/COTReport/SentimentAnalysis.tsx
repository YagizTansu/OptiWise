import React from 'react';
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaHistory } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';

interface SentimentData {
  traderCategory: string;
  sentiment: string;
  netPosition: string;
  change: string;
  longPercentage: string;
  description: string;
}

// Sentiment data moved into the component
const sentimentData: SentimentData[] = [
  {
    traderCategory: 'Large Speculators',
    sentiment: 'bullish',
    netPosition: '+89,452',
    change: '+12.5%',
    longPercentage: '67%',
    description: 'Largest net long position in 6 months. Typically signals strong upward momentum.'
  },
  {
    traderCategory: 'Commercial Traders',
    sentiment: 'bearish',
    netPosition: '-63,287',
    change: '-8.7%',
    longPercentage: '42%',
    description: 'Increased short positions over past 3 weeks. Often hedge against market downturns.'
  },
  {
    traderCategory: 'Small Speculators',
    sentiment: 'neutral',
    netPosition: '+3,835',
    change: '+2.1%',
    longPercentage: '51%',
    description: 'Nearly balanced positions indicate uncertainty among retail traders.'
  },
  {
    traderCategory: 'Overall Market',
    sentiment: 'bullish',
    netPosition: '+30,000',
    change: '+5.4%',
    longPercentage: '56%',
    description: 'Divergence between trader categories suggests potential volatility ahead.'
  }
];

interface SentimentAnalysisProps {
  symbol: string;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ symbol }) => {
  return (
    <div className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <h2>Sentiment Analysis - {symbol}</h2>
        <button className={styles.modernIconButton} title="Latest Report: July 21, 2023">
          <FaHistory />
        </button>
      </div>

      <table className={styles.sentimentTable}>
        <thead>
          <tr>
            <th>Trader Category</th>
            <th>Sentiment</th>
            <th>Net Position</th>
            <th>Change</th>
            <th>Long %</th>
            <th>Analysis</th>
          </tr>
        </thead>
        <tbody>
          {sentimentData.map((row, index) => (
            <tr key={index}>
              <td><strong>{row.traderCategory}</strong></td>
              <td>
                {row.sentiment === 'bullish' && (
                  <span className={`${styles.sentimentBadge} ${styles.bullishBadge}`}>
                    <FaArrowUp className={styles.badgeIcon} /> Bullish
                  </span>
                )}
                {row.sentiment === 'bearish' && (
                  <span className={`${styles.sentimentBadge} ${styles.bearishBadge}`}>
                    <FaArrowDown className={styles.badgeIcon} /> Bearish
                  </span>
                )}
                {row.sentiment === 'neutral' && (
                  <span className={`${styles.sentimentBadge} ${styles.neutralBadge}`}>
                    <FaExchangeAlt className={styles.badgeIcon} /> Neutral
                  </span>
                )}
              </td>
              <td className={row.netPosition.startsWith('+') ? styles.positive : styles.negative}>
                {row.netPosition}
              </td>
              <td className={row.change.startsWith('+') ? styles.positive : styles.negative}>
                {row.change}
              </td>
              <td>{row.longPercentage}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SentimentAnalysis;
