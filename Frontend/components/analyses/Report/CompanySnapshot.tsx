import React, { useEffect, useState } from 'react';
import styles from '../../../styles/Analyses.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';

interface CompanySnapshotProps {
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

const CompanySnapshot: React.FC<CompanySnapshotProps> = ({ symbol }) => {
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
        setError('Failed to load company snapshot data. Please try again later.');
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
        <p>Loading company snapshot data...</p>
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

  if (!insightsData || !insightsData.companySnapshot) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p>No company snapshot data available for {symbol}</p>
      </div>
    );
  }

  // Define metric explanations
  const metricExplanations: {[key: string]: string} = {
    innovativeness: "Measures the company's R&D spending, patent activity, and product innovation relative to industry peers. Higher scores indicate greater innovation potential and future growth opportunities.",
    hiring: "Tracks employment growth and job posting activity. Higher scores suggest company expansion and positive business outlook.",
    sustainability: "Evaluates environmental practices, resource management, and long-term sustainability initiatives. Higher scores indicate better ESG (Environmental, Social, Governance) performance.",
    insiderSentiments: "Reflects recent insider buying and selling patterns. Higher scores indicate positive insider confidence in the company's prospects.",
    earningsReports: "Measures earnings performance against expectations. Higher scores show stronger earnings results relative to analyst forecasts.",
    dividends: "Evaluates dividend yield, growth, and sustainability. Higher scores indicate more favorable dividend policies for shareholders."
  };

  return (
    <div className={styles.analysisCard}>
      <div className={styles.sectionHeadingWithInfo}>
        <h3>Company Snapshot</h3>
        <InfoButton 
          title="Company Snapshot" 
          content="This section compares the company's key performance metrics against sector averages. Higher percentages indicate better performance relative to industry peers in that category." 
        />
      </div>
      <p className={styles.sectionDescription}>
        Key metrics comparison between {insightsData.symbol} and {insightsData.companySnapshot.sectorInfo} sector average
      </p>

      <div className={styles.companySnapshotGrid}>
        {Object.entries(insightsData.companySnapshot.company || {}).map(([key, value]) => {
          const sectorValue = insightsData.companySnapshot.sector?.[key as keyof typeof insightsData.companySnapshot.sector] || 0;
          const percentValue = Math.round((value as number) * 100);
          const sectorPercentValue = Math.round(sectorValue * 100);
          const isHigherThanSector = percentValue > sectorPercentValue;
          
          return (
            <div className={styles.snapshotMetricCard} key={key}>
              <div className={styles.metricHeader}>
                <h4>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</h4>
                <InfoButton 
                  title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} 
                  content={metricExplanations[key] || `Performance metric that compares ${key} against industry averages.`} 
                />
              </div>
              <div className={styles.progressBarContainer}>
                <div className={`${styles.progressBarLabel} ${isHigherThanSector ? styles.positive : ''}`}>
                  {percentValue}%
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${percentValue}%` }}
                  />
                </div>
              </div>
              <p className={styles.sectorCompare}>
                Sector: {sectorPercentValue}%
                {isHigherThanSector ? 
                  <span className={styles.positive}> (+{percentValue - sectorPercentValue}%)</span> : 
                  <span className={styles.negative}> ({percentValue - sectorPercentValue}%)</span>
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompanySnapshot;
