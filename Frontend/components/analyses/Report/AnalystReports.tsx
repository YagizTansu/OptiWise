import React, { useEffect, useState } from 'react';
import styles from '../../../styles/reports/AnalystReports.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';
import { FaExclamationTriangle } from 'react-icons/fa';

interface AnalystReportsProps {
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

const AnalystReports: React.FC<AnalystReportsProps> = ({ symbol }) => {
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
        setError('Failed to load analyst reports data. Please try again later.');
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
        <h3>Loading Analyst Reports</h3>
        <p>Retrieving research reports and analysis for {symbol}...</p>
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
            loadInsights();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Enhanced check to ensure reports exist and have content
  if (!insightsData || 
      !insightsData.reports || 
      insightsData.reports.length === 0 ||
      (insightsData.reports && insightsData.reports.every(report => !report.title && !report.provider))) {
    return (
      <div className={styles.analysisCard}>
        <div className={styles.enhancedNoDataMessage}>
          <FaExclamationTriangle className={styles.noDataIcon} />
          <h4>No Analyst Reports Available</h4>
          <p>We couldn't find any analyst reports for {symbol} at this time. This may be due to limited analyst coverage or the company being newly listed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analysisCard}>
      <div className={styles.sectionHeadingWithInfo}>
        <h3>Analyst Reports</h3>
        <InfoButton 
          title="Analyst Reports" 
          content="Recent research reports from financial institutions covering this stock. These reports contain detailed analysis of the company's performance, future prospects, and investment recommendations based on thorough research." 
        />
      </div>
      <div className={styles.reportsTable}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Provider</th>
              <th>Rating</th>
              <th>Target Price</th>
            </tr>
          </thead>
          <tbody>
            {insightsData.reports.slice(0, 5).map((report) => (
              <tr key={report.id}>
                <td>{formatDate(report.reportDate)}</td>
                <td className={styles.reportTitle}>{report.title}</td>
                <td>{report.provider}</td>
                <td className={
                  report.investmentRating === 'Bullish' ? styles.positive :
                  report.investmentRating === 'Bearish' ? styles.negative :
                  styles.neutral
                }>
                  {report.investmentRating || 'N/A'}
                </td>
                <td>{report.targetPrice ? `$${report.targetPrice}` : 'N/A'} {report.targetPriceStatus ? `(${report.targetPriceStatus})` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalystReports;
