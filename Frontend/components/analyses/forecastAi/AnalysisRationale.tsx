import React, { useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import styles from '../../../styles/forecastAi/AnalysisRationale.module.css';

interface AnalysisRationaleProps {
  technicalFactors: {
    technical: Record<string, string>;
    fundamental: Record<string, string>;
    sentiment: Record<string, string>;
  };
  sentimentData: Record<string, string>;
}

const AnalysisRationale: React.FC<AnalysisRationaleProps> = ({ 
  technicalFactors,
  sentimentData 
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const tooltipContent: Record<string, string> = {
    'RSI': 'Relative Strength Index - Measures the speed and change of price movements on a scale of 0-100.',
    'MACD': 'Moving Average Convergence Divergence - A trend-following momentum indicator.',
    'Moving Averages': 'Shows the average price of an asset over a specified time period.',
    'Volume': 'The number of shares traded during a given period.',
    'Chart Pattern': 'Visual patterns in price charts that can indicate future price movements.',
    'Earnings Growth': 'Percentage increase in a company\'s earnings per share.',
    'Revenue Growth': 'Year-over-year percentage increase in company revenue.',
    'P/E Ratio': 'Price-to-Earnings ratio - Measures current share price relative to earnings per share.',
    'Debt/Equity': 'Total liabilities divided by total shareholder equity.',
    'Cash Reserves': 'Amount of cash a company keeps to meet short-term needs.'
  };

  const handleTooltipToggle = (key: string) => {
    if (activeTooltip === key) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(key);
    }
  };

  // Format the sentiment text to be more readable
  const formatSentimentText = (text: string) => {
    if (!text) return '';
    return text.replace(/:/g, ': ').replace(/-/g, ' - ');
  };

  // Get indicator class based on value for visual cues
  const getIndicatorClass = (value: string) => {
    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('bullish') || lowerValue.includes('strong') || lowerValue.includes('above')) {
      return styles.positiveIndicator;
    } else if (lowerValue.includes('bearish') || lowerValue.includes('weak') || lowerValue.includes('below')) {
      return styles.negativeIndicator;
    } else {
      return styles.neutralIndicator;
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Analysis Rationale</h3>
      
      <div className={styles.rationales}>
        {/* Technical Factors */}
        <div className={styles.factorCard}>
          <div className={styles.cardHeader}>
            <h4>Technical Factors</h4>
            <div className={styles.cardBadge}>Short-term Indicators</div>
          </div>
          <div className={styles.factorGrid}>
            {Object.entries(technicalFactors.technical).map(([key, value]) => (
              <div key={key} className={styles.factorItem}>
                <div className={styles.factorLabel}>
                  {key}
                  {tooltipContent[key] && (
                    <button 
                      className={styles.infoButton}
                      onClick={() => handleTooltipToggle(key)}
                      aria-label={`Info about ${key}`}
                    >
                      <FiInfo />
                    </button>
                  )}
                </div>
                <div className={`${styles.factorValue} ${getIndicatorClass(value)}`}>
                  {value}
                </div>
                {activeTooltip === key && tooltipContent[key] && (
                  <div className={styles.tooltip}>
                    {tooltipContent[key]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fundamental Factors */}
        <div className={styles.factorCard}>
          <div className={styles.cardHeader}>
            <h4>Fundamental Factors</h4>
            <div className={styles.cardBadge}>Medium-term Indicators</div>
          </div>
          <div className={styles.factorGrid}>
            {Object.entries(technicalFactors.fundamental).map(([key, value]) => (
              <div key={key} className={styles.factorItem}>
                <div className={styles.factorLabel}>
                  {key}
                  {tooltipContent[key] && (
                    <button 
                      className={styles.infoButton}
                      onClick={() => handleTooltipToggle(key)}
                      aria-label={`Info about ${key}`}
                    >
                      <FiInfo />
                    </button>
                  )}
                </div>
                <div className={`${styles.factorValue} ${getIndicatorClass(value)}`}>
                  {value}
                </div>
                {activeTooltip === key && tooltipContent[key] && (
                  <div className={styles.tooltip}>
                    {tooltipContent[key]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Sentiment */}
      <div className={styles.sentimentCard}>
        <div className={styles.cardHeader}>
          <h4>Market Sentiment</h4>
          <div className={styles.cardBadge}>Analyst & Market Perception</div>
        </div>
        <div className={styles.sentimentContent}>
          {Object.entries(sentimentData)
            .filter(([key]) => !key.includes('**'))
            .map(([key, value], index) => {
              // Check if value is long enough to be a paragraph
              if (value && value.length > 100) {
                return (
                  <div key={index} className={styles.sentimentParagraph}>
                    <h5>{key.replace(/\*\*/g, '')}</h5>
                    <p>{formatSentimentText(value)}</p>
                  </div>
                );
              } else {
                return (
                  <div key={index} className={styles.sentimentItem}>
                    <div className={styles.sentimentLabel}>{key.replace(/\*\*/g, '')}</div>
                    <div className={`${styles.sentimentValue} ${getIndicatorClass(value)}`}>
                      {value}
                    </div>
                  </div>
                );
              }
            })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisRationale;
