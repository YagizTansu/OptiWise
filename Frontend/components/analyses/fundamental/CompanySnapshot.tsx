import React, { useEffect, useState } from 'react';
import styles from '../../../styles/fundamental/CompanySnapshot.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';
import { FaQuestion, FaTimes } from 'react-icons/fa';

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
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

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
      <div className={styles.seasonalityHeader} style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%' 
      }}>
        <h3>Company Snapshot</h3>
        <div className={styles.chartControls} style={{ marginLeft: 'auto' }}>
          <button 
            className={styles.modernIconButton} 
            title="Learn More"
            onClick={() => setShowInfoModal(true)}
          >
            <FaQuestion />
          </button>
        </div>
      </div>

      {/* Information Modal - matching other components */}
      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Company Snapshot Explained</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowInfoModal(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <h4>What is a Company Snapshot?</h4>
              <p>
                The Company Snapshot compares key performance metrics against sector averages, providing 
                a quick overview of how the company performs in various aspects relative to its peers.
              </p>
              
              <h4>Understanding the Metrics:</h4>
              <p><strong>Innovativeness:</strong> Measures R&D spending, patent activity, and product innovation relative to industry peers.</p>
              <p><strong>Hiring:</strong> Tracks employment growth and job posting activity to indicate company expansion.</p>
              <p><strong>Sustainability:</strong> Evaluates environmental practices, resource management, and long-term sustainability initiatives.</p>
              <p><strong>Insider Sentiments:</strong> Reflects recent insider buying and selling patterns.</p>
              <p><strong>Earnings Reports:</strong> Measures earnings performance against expectations.</p>
              <p><strong>Dividends:</strong> Evaluates dividend yield, growth, and sustainability.</p>
              
              <h4>How to Read the Data:</h4>
              <p>
                Higher percentages indicate better performance relative to industry peers. Green indicators show
                where the company outperforms its sector average, while red indicators highlight areas
                where the company underperforms.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.applyButton}
                onClick={() => setShowInfoModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

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
                <div className={`${styles.progressBarLabel} ${isHigherThanSector ? styles.positive : styles.negative}`}>
                  {percentValue}%
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${percentValue}%` }}
                  />
                  {/* Add sector marker on the progress bar */}
                  <div 
                    className={styles.sectorMarker} 
                    style={{ left: `${sectorPercentValue}%` }} 
                    title={`Sector average: ${sectorPercentValue}%`}
                  ></div>
                </div>
              </div>
              <p className={styles.sectorCompare}>
                <span className={styles.comparisonLabel}>
                  {isHigherThanSector ? 'Outperforms sector by:' : 'Behind sector by:'}
                </span>
                <span className={isHigherThanSector ? styles.positive : styles.negative}>
                  {Math.abs(percentValue - sectorPercentValue)}%
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompanySnapshot;
