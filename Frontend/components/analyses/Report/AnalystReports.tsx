import React, { useEffect, useState } from 'react';
import styles from '../../../styles/reports/AnalystReports.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';

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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading analyst reports data...</p>
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

  if (!insightsData || !insightsData.reports || insightsData.reports.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p>No analyst reports available for {symbol}</p>
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
