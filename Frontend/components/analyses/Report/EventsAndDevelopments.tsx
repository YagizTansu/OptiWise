import React, { useEffect, useState } from 'react';
import styles from '../../../styles/reports/EventsAndDevelopments.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';
import { FaExclamationTriangle } from 'react-icons/fa';

interface EventsAndDevelopmentsProps {
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

const EventsAndDevelopments: React.FC<EventsAndDevelopmentsProps> = ({ symbol }) => {
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
        setError('Failed to load events and developments data. Please try again later.');
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
        <h3>Loading Events and Developments</h3>
        <p>Retrieving company events and significant developments for {symbol}...</p>
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
            // loadInsights();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!insightsData || (!insightsData.events?.length && !insightsData.sigDevs?.length)) {
    return (
      <div className={styles.analysisCard}>
        <div className={styles.enhancedNoDataMessage}>
          <FaExclamationTriangle className={styles.noDataIcon} />
          <h4>No Events or Developments Available</h4>
          <p>We couldn't find any events or developments for {symbol} at this time. This may be due to limited data availability or the company being newly listed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analysisCard}>
      <div className={styles.sectionHeadingWithInfo}>
        <h3>Recent Events and Developments</h3>
        <InfoButton 
          title="Recent Events and Developments" 
          content="Important events that may affect the company's stock price, including technical pattern formations, significant company announcements, and market-moving news." 
        />
      </div>
      
      {insightsData.events?.length > 0 && (
        <div className={styles.eventsContainer}>
          <div className={styles.metricHeader}>
            <h4>Technical Events</h4>
            <InfoButton 
              title="Technical Events" 
              content="Important chart patterns, price movements, or technical indicator signals that may indicate future price direction. These are derived from analyzing historical price and volume data." 
            />
          </div>
          <div className={styles.eventCards}>
            {insightsData.events.map((event, index) => (
              <div className={styles.eventCard} key={`event-${index}`}>
                <div className={styles.eventType}>{event.eventType}</div>
                <div className={styles.eventDetails}>
                  <p>Period: {event.pricePeriod} | Horizon: {event.tradingHorizon}</p>
                  <p>Trade Type: {event.tradeType}</p>
                  <p>Date Range: {formatDate(event.startDate)} - {formatDate(event.endDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {insightsData.sigDevs?.length > 0 && (
        <div className={styles.sigDevsContainer}>
          <div className={styles.metricHeader}>
            <h4>Significant Developments</h4>
            <InfoButton 
              title="Significant Developments" 
              content="Major announcements or news that could significantly impact the company's business operations or stock performance, such as earnings surprises, management changes, or strategic shifts." 
            />
          </div>
          <ul className={styles.sigDevsList}>
            {insightsData.sigDevs.map((dev, index) => (
              <li key={`dev-${index}`}>
                <span className={styles.sigDevDate}>{formatDate(dev.date)}</span>
                <span className={styles.sigDevHeadline}>{dev.headline}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EventsAndDevelopments;
