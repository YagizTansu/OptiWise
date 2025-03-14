import { useState, useEffect } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
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
  shareholdersYield: string;
  dividend: {
    exDate: string;
    paymentDate: string;
    annualDividend: string;
    dividendYield: string;
  }
}

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
        const summaryResponse = await fetch(`http://localhost:3001/api/finance/quoteSummary?symbol=${symbol}&modules=calendarEvents,defaultKeyStatistics,summaryDetail`);
        const summaryData = await summaryResponse.json();
        
        // Extract and format quote data
        const quote = Array.isArray(quoteData) ? quoteData[0] : quoteData;
        
        // Extract data from summary response
        const calendarEvents = summaryData?.quoteSummary?.result?.[0]?.calendarEvents || {};
        const summaryDetail = summaryData?.quoteSummary?.result?.[0]?.summaryDetail || {};
        
        // Format market cap (convert from raw number to billions/millions)
        const formatMarketCap = (marketCap: number) => {
          if (!marketCap) return '-';
          if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)}T`;
          if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(2)}B`;
          if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(2)}M`;
          return `${marketCap.toFixed(2)}`;
        };

        // Format date from timestamp
        const formatDate = (timestamp: number) => {
          if (!timestamp) return '-';
          return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
          });
        };

        // Calculate shareholders yield (dividend yield + buyback yield)
        const dividendYield = summaryDetail?.dividendYield?.raw || 0;
        // Buyback yield would require additional API data, using 0 as placeholder
        const buybackYield = 0;
        const shareholdersYield = (dividendYield + buybackYield) * 100;

        setFinancialData({
          nextEarnings: calendarEvents?.earnings?.earningsDate?.[0]?.raw 
            ? formatDate(calendarEvents.earnings.earningsDate[0].raw)
            : '-',
          marketCap: formatMarketCap(quote?.marketCap || 0),
          eps: quote?.epsTrailingTwelveMonths?.toFixed(2) || '-',
          pe: quote?.trailingPE?.toFixed(2) || '-',
          lastClose: quote?.regularMarketPrice?.toFixed(2) || '-',
          shareholdersYield: shareholdersYield.toFixed(2),
          dividend: {
            exDate: summaryDetail?.exDividendDate?.raw ? formatDate(summaryDetail.exDividendDate.raw) : '-',
            paymentDate: '-', // Not typically available in the API
            annualDividend: summaryDetail?.dividendRate?.fmt || '-',
            dividendYield: summaryDetail?.dividendYield?.fmt || '-'
          }
        });
      } catch (err) {
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
          <span className={styles.metricLabel}>Shareholders Yield</span>
          <span className={styles.metricValue}>{financialData.shareholdersYield}%</span>
        </div>
        {financialData.dividend.dividendYield !== '-' && (
          <div className={styles.metricItem} style={{ 
            display: 'flex', 
            flexDirection: 'column',
            padding: '1rem',
            backgroundColor: '#f7f7f7',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <span className={styles.metricLabel}>Dividend Yield</span>
            <span className={styles.metricValue}>{financialData.dividend.dividendYield}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyMetrics;
