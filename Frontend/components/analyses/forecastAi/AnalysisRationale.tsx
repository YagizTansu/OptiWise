import React, { useState } from 'react';
import styles from '../../../styles/ForecastAI.module.css';

interface TechnicalFactors {
  technical: Record<string, string>;
  fundamental: Record<string, string>;
  sentiment: Record<string, string>;
}

interface AnalysisRationaleProps {
  technicalFactors: TechnicalFactors;
  sentimentData: Record<string, string>;
}

// Custom Tooltip component
const CustomTooltip = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <span 
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span className={styles.tooltipText}>
          {title}
        </span>
      )}
    </span>
  );
};

// Technical terminology explanations
const termDefinitions: Record<string, string> = {
  'RSI': 'Relative Strength Index - Measures the speed and change of price movements, indicating overbought (>70) or oversold (<30) conditions.',
  'MACD': 'Moving Average Convergence Divergence - Shows the relationship between two moving averages of a security\'s price, indicating momentum shifts.',
  'Moving Averages': 'Lines showing the average price over specified time periods, helping identify trends and potential support/resistance levels.',
  'Volume': 'The number of shares traded in a given time period, indicating the strength behind price movements.',
  'Chart Pattern': 'Recognizable patterns in price charts that may indicate continuation or reversal of trends.',
  'Earnings Growth': 'The rate at which a company\'s earnings are increasing, a key factor in stock valuation.',
  'Revenue Growth': 'The rate at which a company\'s sales are increasing, indicating business expansion.',
  'P/E Ratio': 'Price-to-Earnings Ratio - Compares a company\'s share price to its earnings per share, indicating valuation.',
  'Debt/Equity': 'Ratio comparing a company\'s debt to its equity, indicating financial leverage and risk.',
  'News Sentiment': 'The general attitude of news coverage towards a company, which can influence stock price movements.',
  'Analyst Ratings': 'Professional recommendations (buy, hold, sell) from financial analysts, influencing investor decisions.',
  'Options Put/Call': 'Ratio of put options to call options, indicating market sentiment (bearish vs. bullish).',
  'Insider Activity': 'Buying or selling of company shares by company executives and directors, which may signal confidence levels.'
};

const AnalysisRationale: React.FC<AnalysisRationaleProps> = ({ technicalFactors, sentimentData }) => {
  return (
    <div className={styles.rationaleSection}>
      <h3>Analysis Rationale</h3>
      <div className={styles.factorsGrid}>
        <div className={styles.factorCard}>
          <h4>Technical Factors</h4>
          <ul>
            {Object.entries(technicalFactors.technical || {}).map(([key, value], index) => (
              <li key={`tech-${index}`}>
                <div className={styles.factorItem}>
                  <strong>{key}:</strong> {value}
                  {termDefinitions[key] && (
                    <CustomTooltip title={termDefinitions[key]}>
                      <span className={styles.infoIcon}>ⓘ</span>
                    </CustomTooltip>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.factorCard}>
          <h4>Fundamental Factors</h4>
          <ul>
            {Object.entries(technicalFactors.fundamental || {}).map(([key, value], index) => (
              <li key={`fund-${index}`}>
                <div className={styles.factorItem}>
                  <strong>{key}:</strong> {value}
                  {termDefinitions[key] && (
                    <CustomTooltip title={termDefinitions[key]}>
                      <span className={styles.infoIcon}>ⓘ</span>
                    </CustomTooltip>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.factorCard}>
          <h4>Market Sentiment</h4>
          <ul>
            {Object.entries(sentimentData).map(([key, value], index) => (
              <li key={`sent-${index}`}>
                <div className={styles.factorItem}>
                  <strong>{key}:</strong> {value}
                  {termDefinitions[key] && (
                    <CustomTooltip title={termDefinitions[key]}>
                      <span className={styles.infoIcon}>ⓘ</span>
                    </CustomTooltip>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisRationale;
