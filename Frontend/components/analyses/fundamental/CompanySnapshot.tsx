import React, { useEffect, useState } from 'react';
import styles from '../../../styles/fundamental/CompanySnapshot.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';
import { FaQuestion, FaExclamationTriangle } from 'react-icons/fa';

interface CompanySnapshotProps {
  symbol: string;
}

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
        setError('Failed to load company snapshot data.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [symbol]);

  if (loading) {
    return (
      <div className={styles.modernLoadingContainer}>
        <div className={styles.loadingSpinnerLarge}></div>
        <h3>Loading Company Snapshot</h3>
        <p>Retrieving company metrics and sector comparisons for {symbol}...</p>
      </div>
    );
  }

  if (error || !insightsData || !insightsData.companySnapshot) {
    return (
      <div className={styles.analysisCard}>
        <div className={styles.enhancedNoDataMessage}>
          <FaExclamationTriangle className={styles.noDataIcon} />
          <h4>No Company Snapshot Data Available</h4>
          <p>We couldn't find any company snapshot data for {symbol} at this time. This may be due to incomplete market data or the company being newly listed.</p>
        </div>
      </div>
    );
  }

  // Simplified metric explanations
  const metricExplanations: {[key: string]: string} = {
    innovativeness: "R&D spending and innovation compared to peers",
    hiring: "Employment growth and job posting activity",
    sustainability: "Environmental and sustainability practices",
    insiderSentiments: "Recent insider trading patterns",
    earningsReports: "Earnings performance vs. expectations",
    dividends: "Dividend yield, growth, and sustainability"
  };

  return (
    <div className={styles.analysisCard}>
      <div className={styles.cardHeader}>
        <h3>Company Snapshot</h3>
        <button 
          className={styles.modernIconButton}
          onClick={() => setShowInfoModal(!showInfoModal)}
          aria-label="Information"
        >
          <FaQuestion />
        </button>
      </div>

      {showInfoModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Company Snapshot</h3>
              <button onClick={() => setShowInfoModal(false)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <p>Compares key metrics against sector averages.</p>
              {Object.entries(metricExplanations).map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className={styles.sectionDescription}>
        {insightsData.symbol} vs {insightsData.companySnapshot.sectorInfo} average
      </p>

      <div className={styles.metricsGrid}>
        {Object.entries(insightsData.companySnapshot.company || {}).map(([key, value]) => {
          const sectorValue = (insightsData.companySnapshot.sector as Record<string, number>)?.[key] || 0;
          const percentValue = Math.round((value as number) * 100);
          const isHigherThanSector = percentValue > Math.round(sectorValue * 100);
          
          return (
            <div className={styles.metricCard} key={key}>
              <div className={styles.metricHeader}>
                <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                <span 
                  className={`${styles.metricValue} ${isHigherThanSector ? styles.positive : styles.negative}`}
                >
                  {percentValue}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${percentValue}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompanySnapshot;
