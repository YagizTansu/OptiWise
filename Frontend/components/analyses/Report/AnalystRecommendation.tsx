import React, { useEffect, useState } from 'react';
import styles from '../../../styles/reports/AnalystRecommendation.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';

interface AnalystRecommendationProps {
  symbol: string;
}

// InfoButton component
const InfoButton: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className={styles.infoButtonContainer}>
      <button 
        className={styles.infoButton}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Information about ${title}`}
      >
        <span className={styles.infoIcon}>ⓘ</span>
      </button>
      {showTooltip && (
        <div className={styles.infoTooltip}>
          <div className={styles.tooltipTitle}>{title}</div>
          <div className={styles.tooltipContent}>{content}</div>
        </div>
      )}
    </div>
  );
};

const AnalystRecommendation: React.FC<AnalystRecommendationProps> = ({ symbol }) => {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const data = await fetchInsightsData(symbol);
        setInsightsData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading insights:', err);
        setError('Failed to load analyst recommendation data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [symbol]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading analyst recommendation data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!insightsData || !insightsData.recommendation) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p>No analyst recommendation data available for {symbol}</p>
      </div>
    );
  }

  return (
    <div className={styles.analysisCard}>
      <div className={styles.sectionHeadingWithInfo}>
        <h3>Analyst Recommendation</h3>
        <InfoButton 
          title="Analyst Recommendations" 
          content="Consensus recommendations from financial analysts who follow this stock. Based on detailed analysis of the company's business model, financial statements, and growth prospects, analysts provide BUY, HOLD, or SELL recommendations along with price targets." 
        />
      </div>
      <div className={styles.recommendationCard}>
        <div className={styles.recommendationHeader}>
          <div className={`${styles.recommendationBadge} ${
            insightsData.recommendation.rating === 'BUY' ? styles.positive :
            insightsData.recommendation.rating === 'SELL' ? styles.negative :
            styles.neutral
          }`}>
            {insightsData.recommendation.rating}
          </div>
          <div className={styles.recommendationProvider}>
            {insightsData.recommendation.provider}
          </div>
        </div>
        <div className={styles.recommendationPrice}>
          <div className={styles.metricHeader}>
            <h4>Target Price</h4>
            <InfoButton 
              title="Target Price" 
              content="The predicted stock price for the next 12 months, based on analysts' estimates. This represents where professional analysts expect the stock to trade within a year based on their financial models." 
            />
          </div>
          <p className={styles.targetPrice}>${insightsData.recommendation.targetPrice}</p>
        </div>
      </div>

      <div className={styles.bullBearSection}>
        <div className={styles.bullBearCard}>
          <div className={styles.metricHeader}>
            <h4>Bullish Factors</h4>
            <InfoButton 
              title="Bullish Factors" 
              content="Key positive elements that could drive the stock price higher. These represent the main reasons analysts are optimistic about the company's future performance." 
            />
          </div>
          <ul className={styles.bullBearList}>
            {insightsData.upsell?.msBullishSummary?.map((point, index) => (
              <li key={`bullish-${index}`} className={styles.bullPoint}>{point}</li>
            )) || <li>No bullish factors available</li>}
          </ul>
        </div>
        <div className={styles.bullBearCard}>
          <div className={styles.metricHeader}>
            <h4>Bearish Factors</h4>
            <InfoButton 
              title="Bearish Factors" 
              content="Key risk factors that could negatively impact the stock price. These represent the main concerns analysts have about the company's future performance and potential challenges." 
            />
          </div>
          <ul className={styles.bullBearList}>
            {insightsData.upsell?.msBearishSummary?.map((point, index) => (
              <li key={`bearish-${index}`} className={styles.bearPoint}>{point}</li>
            )) || <li>No bearish factors available</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalystRecommendation;
