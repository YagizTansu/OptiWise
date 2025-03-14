import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';

interface AnalysisToolsProps {
  symbol: string;
}

interface AnalysisData {
  recommendationTrend?: any;
  earningsHistory?: any;
  earningsTrend?: any;
  calendarEvents?: any;
}

const AnalysisTools = ({ symbol }: AnalysisToolsProps) => {
  const [data, setData] = useState<AnalysisData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('recommendations');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const modules = [
          'recommendationTrend', 
          'earningsHistory', 
          'earningsTrend',
          'calendarEvents'
        ];
        
        const response = await axios.get(`http://localhost:3001/api/finance/quoteSummary?symbol=${symbol}&modules=${modules.join(',')}`);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analysis data');
        setLoading(false);
        console.error(err);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  // Format recommendation period to be more descriptive
  const formatRecommendationPeriod = (period: string) => {
    // Yahoo Finance typically returns periods like "0m", "+1m", "-1m" etc.
    if (period === "0m") return "Current Month";
    if (period === "-1m") return "Last Month";
    if (period === "-2m") return "Two Months Ago";
    if (period === "-3m") return "Three Months Ago";
    
    // For other formats, try to parse and provide better description
    if (period.endsWith('m')) {
      const num = parseInt(period);
      if (!isNaN(num)) {
        return num > 0 ? `${num} Months Ahead` : `${Math.abs(num)} Months Ago`;
      }
    }
    
    return period; // Return original if we can't parse it
  };

  // Get section description based on active section
  const getSectionDescription = () => {
    switch(activeSection) {
      case 'recommendations':
        return 'Analyst recommendations and consensus ratings for this security';
      case 'earningsHistory':
        return 'Historical quarterly earnings data and analyst expectations';
      case 'earningsForecast':
        return 'Future earnings projections and growth estimates';
      case 'calendarEvents':
        return 'Upcoming earnings dates, dividends, and other important events';
      default:
        return '';
    }
  };

  // Render recommendation trends
  const renderRecommendations = () => {
    const recommendations = data.recommendationTrend?.trend || [];
    if (recommendations.length === 0) return <div className={styles.noStatementData}>No recommendation data available</div>;

    return (
      <div className={styles.financialTableContainer}>
        <table className={styles.financialTable}>
          <thead>
            <tr>
              <th>Time Period</th>
              <th>Strong Buy</th>
              <th>Buy</th>
              <th>Hold</th>
              <th>Sell</th>
              <th>Strong Sell</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec: any, index: number) => (
              <tr key={index}>
                <td className={styles.metricLabel}>{formatRecommendationPeriod(rec.period)}</td>
                <td className={styles.metricValue}>{rec.strongBuy}</td>
                <td className={styles.metricValue}>{rec.buy}</td>
                <td className={styles.metricValue}>{rec.hold}</td>
                <td className={styles.metricValue}>{rec.sell}</td>
                <td className={styles.metricValue}>{rec.strongSell}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render earnings history
  const renderEarningsHistory = () => {
    const earningsHistory = data.earningsHistory?.history || [];
    if (earningsHistory.length === 0) return <div className={styles.noStatementData}>No earnings history available</div>;

    return (
      <div className={styles.financialTableContainer}>
        <table className={styles.financialTable}>
          <thead>
            <tr>
              <th>Quarter</th>
              <th>Estimate</th>
              <th>Actual</th>
              <th>Difference</th>
              <th>Surprise %</th>
            </tr>
          </thead>
          <tbody>
            {earningsHistory.map((eh: any, index: number) => (
              <tr key={index}>
                <td className={styles.metricLabel}>{formatDate(eh.quarter)}</td>
                <td className={styles.metricValue}>${eh.epsEstimate?.toFixed(2) || 'N/A'}</td>
                <td className={styles.metricValue}>${eh.epsActual?.toFixed(2) || 'N/A'}</td>
                <td className={styles.metricValue + ' ' + (eh.epsDifference > 0 ? '' : styles.negative)}>
                  ${eh.epsDifference?.toFixed(2) || 'N/A'}
                </td>
                <td className={styles.metricValue + ' ' + (eh.surprisePercent > 0 ? '' : styles.negative)}>
                  {eh.surprisePercent ? (eh.surprisePercent * 100).toFixed(2) + '%' : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render earnings forecast
  const renderEarningsForecast = () => {
    const earningsTrend = data.earningsTrend?.trend || [];
    if (earningsTrend.length === 0) return <div className={styles.noStatementData}>No earnings forecast available</div>;

    // Function to convert period code to more descriptive text
    const getDescriptivePeriod = (periodCode: string) => {
      switch(periodCode) {
        case '0q': return 'Current Quarter';
        case '+1q': return 'Next Quarter';
        case '0y': return 'Current Year';
        case '+1y': return 'Next Year';
        case '+2y': return 'Year After Next';
        default: return periodCode;
      }
    };

    return (
      <div className={styles.financialTableContainer}>
        <table className={styles.financialTable}>
          <thead>
            <tr>
              <th>Period</th>
              <th>Estimate</th>
              <th>Growth</th>
              <th>Low</th>
              <th>High</th>
              <th># of Analysts</th>
            </tr>
          </thead>
          <tbody>
            {earningsTrend.map((et: any, index: number) => (
              <tr key={index}>
                <td className={styles.metricLabel}>{getDescriptivePeriod(et.period)}</td>
                <td className={styles.metricValue}>${et.earningsEstimate?.avg?.toFixed(2) || 'N/A'}</td>
                <td className={styles.metricValue + ' ' + (et.earningsEstimate?.growth > 0 ? '' : styles.negative)}>
                  {et.earningsEstimate?.growth ? (et.earningsEstimate.growth * 100).toFixed(2) + '%' : 'N/A'}
                </td>
                <td className={styles.metricValue}>${et.earningsEstimate?.low?.toFixed(2) || 'N/A'}</td>
                <td className={styles.metricValue}>${et.earningsEstimate?.high?.toFixed(2) || 'N/A'}</td>
                <td className={styles.metricValue}>{et.earningsEstimate?.numberOfAnalysts || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render upcoming earnings dates
  const renderCalendarEvents = () => {
    const calendarEvents = data.calendarEvents || {};
    
    if (!calendarEvents.earnings?.earningsDate || calendarEvents.earnings.earningsDate.length === 0) {
      return <div className={styles.noStatementData}>No upcoming events available</div>;
    }

    return (
      <div className={styles.eventsContainer}>
        <div className={styles.eventCards}>
          {calendarEvents.earnings?.earningsDate && (
            <div className={styles.eventCard}>
              <div className={styles.eventType}>Earnings Announcement</div>
              <div className={styles.eventDetails}>
                <p>
                  <span className={styles.eventLabel}>Date:</span>
                  <span className={styles.eventValue}>
                    {formatDate(calendarEvents.earnings.earningsDate[0])}
                  </span>
                </p>
                {calendarEvents.earnings.earningsAverage && (
                  <p>
                    <span className={styles.eventLabel}>EPS Estimate:</span>
                    <span className={styles.eventValue}>
                      ${calendarEvents.earnings.earningsAverage.toFixed(2)}
                    </span>
                  </p>
                )}
                {calendarEvents.earnings.revenueAverage && (
                  <p>
                    <span className={styles.eventLabel}>Revenue Estimate:</span>
                    <span className={styles.eventValue}>
                      ${(calendarEvents.earnings.revenueAverage/1000000).toFixed(2)}M
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {calendarEvents.dividendDate && (
            <div className={styles.eventCard}>
              <div className={styles.eventType}>Dividend Payment</div>
              <div className={styles.eventDetails}>
                <p>
                  <span className={styles.eventLabel}>Date:</span>
                  <span className={styles.eventValue}>
                    {formatDate(calendarEvents.dividendDate)}
                  </span>
                </p>
                {calendarEvents.exDividendDate && (
                  <p>
                    <span className={styles.eventLabel}>Ex-Dividend Date:</span>
                    <span className={styles.eventValue}>
                      {formatDate(calendarEvents.exDividendDate)}
                    </span>
                  </p>
                )}
                {calendarEvents.dividendRate && (
                  <p>
                    <span className={styles.eventLabel}>Dividend Rate:</span>
                    <span className={styles.eventValue}>
                      ${calendarEvents.dividendRate.toFixed(2)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.financialStatementCard}>
      <div className={styles.cardHeader}>
        <h3>Analysis Tools</h3>
        <div className={styles.statementDescription}>
          <p>{getSectionDescription()}</p>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.statementControls}>
          <div className={styles.controlsRow}>
            <div className={styles.statementTypeControls}>
              <button 
                className={`${styles.statementTypeButton} ${activeSection === 'recommendations' ? styles.activeStatementType : ''}`}
                onClick={() => setActiveSection('recommendations')}
              >
                Recommendations
              </button>
              <button 
                className={`${styles.statementTypeButton} ${activeSection === 'earningsHistory' ? styles.activeStatementType : ''}`}
                onClick={() => setActiveSection('earningsHistory')}
              >
                Earnings History
              </button>
              <button 
                className={`${styles.statementTypeButton} ${activeSection === 'earningsForecast' ? styles.activeStatementType : ''}`}
                onClick={() => setActiveSection('earningsForecast')}
              >
                Earnings Forecast
              </button>
              <button 
                className={`${styles.statementTypeButton} ${activeSection === 'calendarEvents' ? styles.activeStatementType : ''}`}
                onClick={() => setActiveSection('calendarEvents')}
              >
                Calendar Events
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.statementLoading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading analysis data...</p>
          </div>
        ) : error ? (
          <div className={styles.statementError}>
            <p>{error}</p>
            <button 
              className={styles.retryButton} 
              onClick={() => {
                setError(null);
                setLoading(true);
                // Re-fetch data logic would go here
                const fetchData = async () => {
                  try {
                    const modules = [
                      'recommendationTrend', 
                      'earningsHistory', 
                      'earningsTrend',
                      'calendarEvents'
                    ];
                    
                    const response = await axios.get(`http://localhost:3001/api/finance/quoteSummary?symbol=${symbol}&modules=${modules.join(',')}`);
                    setData(response.data);
                    setLoading(false);
                  } catch (err) {
                    setError('Failed to fetch analysis data');
                    setLoading(false);
                    console.error(err);
                  }
                };
                
                if (symbol) {
                  fetchData();
                }
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className={styles.analysisContent}>
            {activeSection === 'recommendations' && renderRecommendations()}
            {activeSection === 'earningsHistory' && renderEarningsHistory()}            
            {activeSection === 'earningsForecast' && renderEarningsForecast()}            
            {activeSection === 'calendarEvents' && renderCalendarEvents()}         
             </div>       
             )}        
      </div>
    </div>
  );
};

export default AnalysisTools;
