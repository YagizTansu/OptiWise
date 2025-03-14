import React, { useEffect, useState } from 'react';
import styles from '../../styles/Analyses.module.css';
import axios from 'axios';

interface ReportProps {
  symbol: string;
}

interface InsightsData {
  symbol: string;
  instrumentInfo: {
    technicalEvents: {
      provider: string;
      sector: string;
      shortTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
      intermediateTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
      longTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
    };
    keyTechnicals: {
      provider: string;
      support: number;
      resistance: number;
      stopLoss: number;
    };
    valuation: {
      color: number;
      description: string;
      discount: string;
      relativeValue: string;
      provider: string;
    };
  };
  companySnapshot: {
    sectorInfo: string;
    company: {
      innovativeness: number;
      hiring: number;
      sustainability: number;
      insiderSentiments: number;
      earningsReports: number;
      dividends: number;
    };
    sector: {
      innovativeness: number;
      hiring: number;
      sustainability: number;
      insiderSentiments: number;
      earningsReports: number;
      dividends: number;
    };
  };
  recommendation: {
    targetPrice: number;
    provider: string;
    rating: string;
  };
  upsell: {
    msBullishSummary: string[];
    msBearishSummary: string[];
    companyName: string;
    msBullishBearishSummariesPublishDate: string;
    upsellReportType: string;
  };
  events: Array<{
    eventType: string;
    pricePeriod: string;
    tradingHorizon: string;
    tradeType: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
  }>;
  reports: Array<{
    id: string;
    headHtml: string;
    provider: string;
    reportDate: string;
    reportTitle: string;
    reportType: string;
    targetPrice?: number;
    targetPriceStatus?: string;
    investmentRating?: string;
    tickers: string[];
    title: string;
  }>;
  sigDevs: Array<{
    headline: string;
    date: string;
  }>;
  secReports: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    filingDate: string;
    snapshotUrl: string;
    formType: string;
  }>;
}

// Add a new InfoButton component
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

const Report: React.FC<ReportProps> = ({ symbol }) => {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3001/api/finance/insights?symbol=${symbol}`);
        setInsightsData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load insights data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
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
        <p>Loading insights data...</p>
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
        <p>No insights data available for {symbol}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Technical Analysis Card */}
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

      {/* Company Snapshot Card */}
      <div className={styles.analysisCard}>
        <div className={styles.sectionHeadingWithInfo}>
          <h3>Company Snapshot</h3>
          <InfoButton 
            title="Company Snapshot" 
            content="This section compares the company's key performance metrics against sector averages. Higher percentages indicate better performance relative to industry peers in that category." 
          />
        </div>
        <p className={styles.sectionDescription}>
          Key metrics comparison between {insightsData?.symbol} and {insightsData?.companySnapshot?.sectorInfo} sector average
        </p>

        <div className={styles.companySnapshotGrid}>
          {Object.entries(insightsData?.companySnapshot?.company || {}).map(([key, value]) => {
            const sectorValue = insightsData?.companySnapshot?.sector?.[key as keyof typeof insightsData.companySnapshot.sector] || 0;
            const percentValue = Math.round((value as number) * 100);
            const sectorPercentValue = Math.round(sectorValue * 100);
            const isHigherThanSector = percentValue > sectorPercentValue;
            
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

      {/* Analyst Recommendation Card */}
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
              insightsData?.recommendation?.rating === 'BUY' ? styles.positive :
              insightsData?.recommendation?.rating === 'SELL' ? styles.negative :
              styles.neutral
            }`}>
              {insightsData?.recommendation?.rating}
            </div>
            <div className={styles.recommendationProvider}>
              {insightsData?.recommendation?.provider}
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
            <p className={styles.targetPrice}>${insightsData?.recommendation?.targetPrice}</p>
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
              {insightsData?.upsell?.msBullishSummary?.map((point, index) => (
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
              {insightsData?.upsell?.msBearishSummary?.map((point, index) => (
                <li key={`bearish-${index}`} className={styles.bearPoint}>{point}</li>
              )) || <li>No bearish factors available</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Reports Card */}
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
              {insightsData?.reports?.slice(0, 5).map((report) => (
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

      {/* Events and Developments Card */}
      <div className={styles.analysisCard}>
        <div className={styles.sectionHeadingWithInfo}>
          <h3>Recent Events and Developments</h3>
          <InfoButton 
            title="Recent Events and Developments" 
            content="Important events that may affect the company's stock price, including technical pattern formations, significant company announcements, and market-moving news." 
          />
        </div>
        
        {insightsData?.events?.length > 0 && (
          <div className={styles.eventsContainer}>
            <div className={styles.metricHeader}>
              <h4>Technical Events</h4>
              <InfoButton 
                title="Technical Events" 
                content="Important chart patterns, price movements, or technical indicator signals that may indicate future price direction. These are derived from analyzing historical price and volume data." 
              />
            </div>
            <div className={styles.eventCards}>
              {insightsData?.events?.map((event, index) => (
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
        
        {insightsData?.sigDevs?.length > 0 && (
          <div className={styles.sigDevsContainer}>
            <div className={styles.metricHeader}>
              <h4>Significant Developments</h4>
              <InfoButton 
                title="Significant Developments" 
                content="Major announcements or news that could significantly impact the company's business operations or stock performance, such as earnings surprises, management changes, or strategic shifts." 
              />
            </div>
            <ul className={styles.sigDevsList}>
              {insightsData?.sigDevs?.map((dev, index) => (
                <li key={`dev-${index}`}>
                  <span className={styles.sigDevDate}>{formatDate(dev.date)}</span>
                  <span className={styles.sigDevHeadline}>{dev.headline}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SEC Filings Card */}
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
              {insightsData?.secReports?.slice(0, 8).map((filing) => (
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
    </div>
  );
};

export default Report;
