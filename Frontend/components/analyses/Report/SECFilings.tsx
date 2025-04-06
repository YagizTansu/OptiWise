import React, { useEffect, useState } from 'react';
import styles from '../../../styles/reports/SECFilings.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';
import { FaExclamationTriangle } from 'react-icons/fa';

interface SECFilingsProps {
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

const SECFilings: React.FC<SECFilingsProps> = ({ symbol }) => {
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
        setError('Failed to load SEC filings data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [symbol]);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.modernLoadingContainer}>
        <div className={styles.loadingSpinnerLarge}></div>
        <h3>Loading SEC Filings</h3>
        <p>Retrieving regulatory filings data for {symbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modernErrorContainer}>
        <div className={styles.errorIconLarge}><FaExclamationTriangle /></div>
        <h3>Unable to Load Data</h3>
        <p>{error}</p>
        <button 
          className={styles.modernRetryButton}
          onClick={() => {
            setLoading(true);
            const loadInsights = async () => {
              try {
                const data = await fetchInsightsData(symbol);
                setInsightsData(data);
                setError(null);
              } catch (err) {
                console.error('Error loading insights:', err);
                setError('Failed to load SEC filings data. Please try again later.');
              } finally {
                setLoading(false);
              }
            };
            loadInsights();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Improved check to ensure secReports exists and has meaningful content
  if (!insightsData || 
      !insightsData.secReports || 
      insightsData.secReports.length === 0 ||
      (insightsData.secReports && insightsData.secReports.every(filing => !filing.formType))) {
    return (
      <div className={styles.analysisCard}>
        <div className={styles.enhancedNoDataMessage}>
          <FaExclamationTriangle className={styles.noDataIcon} />
          <h4>No SEC Filings Available</h4>
          <p>We couldn't find any SEC filings for {symbol} at this time. This may be due to recent filing periods or changes in reporting requirements.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analysisCard}>
      <div className={styles.sectionHeadingWithInfo}>
        <h3>Recent SEC Filings</h3>
        <InfoButton 
          title="SEC Filings" 
          content="Official documents submitted by the company to the Securities and Exchange Commission (SEC). These regulatory filings contain important financial data, business updates, and legal disclosures that public companies are required to report." 
        />
      </div>
      <div className={styles.secFilingsTable}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Form</th>
              <th>Description</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {insightsData.secReports.slice(0, 8).map((filing) => (
              <tr key={filing.id}>
                <td>{formatDate(filing.filingDate)}</td>
                <td>{filing.formType}</td>
                <td>{filing.description}</td>
                <td>{filing.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SECFilings;
