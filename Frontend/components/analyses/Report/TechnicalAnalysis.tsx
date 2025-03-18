import React, { useEffect, useState } from 'react';
import styles from '../../../styles/Analyses.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';

interface TechnicalAnalysisProps {
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

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ symbol }) => {
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
        setError('Failed to load technical analysis data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [symbol]);

  // Helper function for rendering score indicators
  const renderScoreIndicator = (score: number, direction: string) => {
    const getColorClass = () => {
      if (direction === 'Bullish') return styles.positive;
      if (direction === 'Bearish') return styles.negative;
      return styles.neutral;
    };

    const bars = [];
    for (let i = 1; i <= 4; i++) {
      bars.push(
        <div 
          key={i}
          className={`${styles.scoreBar} ${i <= score ? getColorClass() : ''}`}
        />
      );
    }

    return (
      <div className={styles.scoreIndicatorWrapper}>
        {bars}
        <span className={getColorClass()}>{direction} ({score}/4)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading technical analysis data...</p>
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

  if (!insightsData) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p>No technical analysis data available for {symbol}</p>
      </div>
    );
  }

  return (
    <div className={styles.analysisCard}>
      <div className={styles.sectionHeadingWithInfo}>
        <h3>Technical Analysis</h3>
        <InfoButton 
          title="Technical Analysis" 
          content="Technical analysis involves analyzing price movements and patterns to forecast future price behavior. It uses charts, indicators, and historical data to identify trends and potential trading opportunities, independent of a company's fundamentals." 
        />
      </div>
      <p className={styles.sectionDescription}></p>
      <div className={styles.metricsGrid}>
        <div className={`${styles.metricCard} ${
          insightsData?.instrumentInfo?.valuation?.description === 'Overvalued' ? styles.negative : 
          insightsData?.instrumentInfo?.valuation?.description === 'Undervalued' ? styles.positive : 
          styles.neutral
        }`}>
          <div className={styles.metricHeader}>
            <h4>Valuation</h4>
            <InfoButton 
              title="Valuation Indicator" 
              content="This indicates whether a stock is currently trading above (overvalued) or below (undervalued) its estimated fair value based on various financial metrics, historical data, and market comparisons." 
            />
          </div>
          <p className={styles.metricValue}>{insightsData?.instrumentInfo?.valuation?.description}</p>
          <p className={styles.metricSubtitle}>{insightsData?.instrumentInfo?.valuation?.relativeValue} {insightsData?.instrumentInfo?.valuation?.discount}</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h4>Support</h4>
            <InfoButton 
              title="Support Level" 
              content="Support represents a price level where buying interest is strong enough to overcome selling pressure, preventing the price from falling further. It's often based on historical price reactions and can act as a 'floor' for the stock price." 
            />
          </div>
          <p className={styles.metricValue}>${insightsData?.instrumentInfo?.keyTechnicals?.support?.toFixed(2) || 'N/A'}</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h4>Resistance</h4>
            <InfoButton 
              title="Resistance Level" 
              content="Resistance is a price level where selling pressure is expected to overcome buying interest, preventing the price from rising further. It acts as a 'ceiling' for the stock price and is based on historical price movements." 
            />
          </div>
          <p className={styles.metricValue}>${insightsData?.instrumentInfo?.keyTechnicals?.resistance?.toFixed(2) || 'N/A'}</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h4>Stop Loss</h4>
            <InfoButton 
              title="Stop Loss Level" 
              content="A recommended price at which investors might consider selling to minimize potential losses. If the stock falls to or below this level, it could indicate a change in trend or increased downside risk." 
            />
          </div>
          <p className={styles.metricValue}>${insightsData?.instrumentInfo?.keyTechnicals?.stopLoss?.toFixed(2) || 'N/A'}</p>
        </div>
      </div>

      <div className={styles.outlooksContainer}>
        <div className={styles.outlookCard}>
          <div className={styles.metricHeader}>
            <h4>Short Term Outlook</h4>
            <InfoButton 
              title="Short Term Outlook" 
              content="Represents the expected price movement over the next 2-6 weeks. This analysis incorporates recent momentum, volatility patterns, and technical indicators to predict near-term direction."
            />
          </div>
          {renderScoreIndicator(
            insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.score || 0,
            insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.direction || 'Neutral'
          )}
          <p className={styles.outlookDescription}>
            {insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.stateDescription}
          </p>
          <div className={styles.comparisonData}>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Sector:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.sectorDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.sectorDirection === 'Bearish' ? styles.negative :
                styles.neutral
              }>
                {insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.sectorDirection}
              </span>
            </div>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Index:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.indexDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.indexDirection === 'Bearish' ? styles.negative :
                styles.neutral
              }>
                {insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.indexDirection}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.outlookCard}>
          <div className={styles.metricHeader}>
            <h4>Intermediate Term Outlook</h4>
            <InfoButton 
              title="Intermediate Term Outlook" 
              content="Provides analysis for the 1-3 month time horizon. This assessment evaluates medium-term trends, support/resistance levels, and broader market influences that may affect price direction."
            />
          </div>
          {renderScoreIndicator(
            insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.score || 0,
            insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.direction || 'Neutral'
          )}
          <p className={styles.outlookDescription}>
            {insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.stateDescription}
          </p>
          <div className={styles.comparisonData}>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Sector:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.sectorDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.sectorDirection === 'Bearish' ? styles.negative :
                styles.neutral
              }>
                {insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.sectorDirection}
              </span>
            </div>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Index:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.indexDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.indexDirection === 'Bearish' ? styles.negative :
                styles.neutral
              }>
                {insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.indexDirection}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.outlookCard}>
          <div className={styles.metricHeader}>
            <h4>Long Term Outlook</h4>
            <InfoButton 
              title="Long Term Outlook" 
              content="Projects the likely price direction over the next 6-12 months. Considers longer-term trends, cyclical patterns, and persistent market factors that affect the security's performance over extended periods."
            />
          </div>
          {renderScoreIndicator(
            insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.score || 0,
            insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.direction || 'Neutral'
          )}
          <p className={styles.outlookDescription}>
            {insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.stateDescription}
          </p>
          <div className={styles.comparisonData}>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Sector:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.sectorDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.sectorDirection === 'Bearish' ? styles.negative :
                styles.neutral
              }>
                {insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.sectorDirection}
              </span>
            </div>
            <div className={styles.comparisonItem}>
              <span className={styles.comparisonLabel}>Index:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.indexDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.indexDirection === 'Bearish' ? styles.negative :
                styles.neutral
              }>
                {insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.indexDirection}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
