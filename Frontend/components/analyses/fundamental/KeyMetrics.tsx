import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';

interface KeyMetricsProps {
  symbol: string;
}

interface FinancialData {
  nextEarnings: string;
  marketCap: string;
  eps: string;
  pe: string;
  lastClose: string;
  dividend: {
    exDate: string;
    paymentDate: string;
    annualDividend: string;
    dividendYield: string;
  }
}

// Custom tooltip component
const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: 'help', marginLeft: '4px', display: 'flex', alignItems: 'center' }}
      >
        {children}
      </div>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          width: '250px',
          zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          marginBottom: '8px'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: '#333 transparent transparent transparent',
          }}></div>
        </div>
      )}
    </div>
  );
};

const KeyMetrics = ({ symbol }: KeyMetricsProps) => {
  // State to store financial data
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data based on symbol
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch quote data for basic metrics
        const quoteResponse = await fetch(`http://localhost:3001/api/finance/quote?symbol=${symbol}&fields=shortName,regularMarketPrice,marketCap,trailingPE,epsTrailingTwelveMonths`);
        const quoteData = await quoteResponse.json();
        
        // Fetch quote summary for detailed metrics including earnings dates and dividends
        const summaryResponse = await fetch(`http://localhost:3001/api/finance/quoteSummary?symbol=${symbol}&modules=calendarEvents,defaultKeyStatistics,summaryDetail,earnings`);
        const summaryData = await summaryResponse.json();

        // Extract and format quote data
        const quote = Array.isArray(quoteData) ? quoteData[0] : quoteData;
        
        // Extract data from summary response - updated paths based on actual structure
        const calendarEvents = summaryData.calendarEvents || {};
        const summaryDetail = summaryData.summaryDetail || {};

        // Format market cap (convert from raw number to billions/millions)
        const formatMarketCap = (marketCap: number) => {
          if (!marketCap) return '-';
          if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)}T`;
          if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(2)}B`;
          if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(2)}M`;
          return `${marketCap.toFixed(2)}`;
        };

        // Format date from timestamp or ISO string
        const formatDate = (dateValue: number | string) => {
          if (!dateValue) return '-';
          
          try {
            // If it's a string in ISO format
            if (typeof dateValue === 'string') {
              return new Date(dateValue).toLocaleDateString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric' 
              });
            }
            // If it's a Unix timestamp (seconds)
            return new Date(dateValue * 1000).toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: 'numeric' 
            });
          } catch (e) {
            console.error('Date formatting error:', e);
            return '-';
          }
        };

        setFinancialData({
          nextEarnings: calendarEvents?.earnings?.earningsDate?.[0]
            ? formatDate(calendarEvents.earnings.earningsDate[0])
            : '-',
          marketCap: formatMarketCap(quote?.marketCap || 0),
          eps: quote?.epsTrailingTwelveMonths?.toFixed(2) || '-',
          pe: quote?.trailingPE?.toFixed(2) || '-',
          lastClose: quote?.regularMarketPrice?.toFixed(2) || '-',
          dividend: {
            exDate: summaryDetail?.exDividendDate ? formatDate(summaryDetail.exDividendDate) : '-',
            paymentDate: summaryDetail?.dividendDate ? formatDate(summaryDetail.dividendDate) : '-',
            annualDividend: summaryDetail?.dividendRate?.fmt || '-',
            dividendYield: summaryDetail?.dividendYield?.fmt || '-'
          }
        });
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError('Failed to load financial data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  if (loading) {
    return <div className={styles.keyMetricsSection}>Loading financial data...</div>;
  }

  if (error) {
    return <div className={styles.keyMetricsSection}>Error: {error}</div>;
  }

  if (!financialData) {
    return <div className={styles.keyMetricsSection}>No financial data available</div>;
  }

  return (
    <div className={styles.keyMetricsSection} style={{ width: '100%' }}>
      <div className={styles.metricsGrid} style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        width: '100%'
      }}>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}><FaCalendarAlt /> Next Earnings</span>
          <span className={styles.metricValue}>{financialData.nextEarnings}</span>
        </div>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}>Market Cap</span>
          <span className={styles.metricValue}>${financialData.marketCap}</span>
        </div>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}>EPS (TTM)</span>
          <span className={styles.metricValue}>${financialData.eps}</span>
        </div>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}>P/E (TTM)</span>
          <span className={styles.metricValue}>{financialData.pe}</span>
        </div>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}>Last Close</span>
          <span className={styles.metricValue}>${financialData.lastClose}</span>
        </div>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}>
            Dividend Yield
            <Tooltip text="Dividend Yield = Annual Dividend / Stock Price. This ratio measures how much cash flow you're getting for each dollar invested in a stock, similar to ROI for dividends. A 5% yield means you get a 5% return from dividends alone.">
              <FaInfoCircle size={14} />
            </Tooltip>
          </span>
          <span className={styles.metricValue}>{financialData.dividend.dividendYield || '-'}</span>
        </div>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}>Annual Dividend</span>
          <span className={styles.metricValue}>{financialData.dividend.annualDividend || '-'}</span>
        </div>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}>Ex-Dividend Date</span>
          <span className={styles.metricValue}>{financialData.dividend.exDate}</span>
        </div>
        <div className={styles.metricItem} style={{ 
          display: 'flex', 
          flexDirection: 'column',
          padding: '1rem',
          backgroundColor: '#f7f7f7',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <span className={styles.metricLabel}>Payment Date</span>
          <span className={styles.metricValue}>{financialData.dividend.paymentDate}</span>
        </div>
      </div>
    </div>
  );
};

export default KeyMetrics;
