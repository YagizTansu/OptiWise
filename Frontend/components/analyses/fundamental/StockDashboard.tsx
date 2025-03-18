import { useState, useEffect } from 'react';
import styles from '../../../styles/Analyses.module.css';
import { fetchStockDashboardData, QuoteSummaryData } from '../../../services/api/finance';

interface StockDashboardProps {
  symbol: string;
}

const StockDashboard = ({ symbol }: StockDashboardProps) => {
  const [data, setData] = useState<QuoteSummaryData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchStockDashboardData(symbol);
        setData(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stock data');
        setLoading(false);
        console.error(err);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  if (loading) return <div className={styles.loader}>Loading dashboard...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!data.price) return <div className={styles.error}>No data available</div>;

  const formatNumber = (num: number, decimals = 2) => {
    return num ? num.toFixed(decimals) : 'N/A';
  };

  const formatPercent = (num: number) => {
    return num ? `${(num * 100).toFixed(2)}%` : 'N/A';
  };

  const formatLargeNumber = (num: number) => {
    if (!num) return 'N/A';
    if (num >= 1.0e12) return `$${(num / 1.0e12).toFixed(2)}T`;
    if (num >= 1.0e9) return `$${(num / 1.0e9).toFixed(2)}B`;
    if (num >= 1.0e6) return `$${(num / 1.0e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  // Get price data
  const price = data.price;
  const summaryDetail = data.summaryDetail || {};
  const keyStats = data.defaultKeyStatistics || {};
  
  // Determine if stock price is up or down
  const isPositiveChange = price.regularMarketChange > 0;
  const changeClass = isPositiveChange ? styles.positive : styles.negative;

  return (
    <div className={styles.keyMetricsSection}>
      <h3>{price.shortName || price.longName}</h3>
      <div className={styles.priceDisplay}>
        <div className={styles.price}>
          {price.regularMarketPrice?.toFixed(2)} {price.currency}
        </div>
        <div className={`${styles.change} ${changeClass}`}>
          {isPositiveChange ? '+' : ''}{price.regularMarketChange?.toFixed(2)} ({formatPercent(price.regularMarketChangePercent)})
        </div>
      </div>
      
      <div className={styles.tradingDetails}>
        <div className={styles.tradingInfoItem}>
          <span className={styles.metricLabel}>Open</span> 
          <span className={styles.metricValue}>{price.regularMarketOpen?.toFixed(2)}</span>
        </div>
        <div className={styles.tradingInfoItem}>
          <span className={styles.metricLabel}>High</span> 
          <span className={styles.metricValue}>{price.regularMarketDayHigh?.toFixed(2)}</span>
        </div>
        <div className={styles.tradingInfoItem}>
          <span className={styles.metricLabel}>Low</span> 
          <span className={styles.metricValue}>{price.regularMarketDayLow?.toFixed(2)}</span>
        </div>
        <div className={styles.tradingInfoItem}>
          <span className={styles.metricLabel}>Prev Close</span> 
          <span className={styles.metricValue}>{price.regularMarketPreviousClose?.toFixed(2)}</span>
        </div>
        <div className={styles.tradingInfoItem}>
          <span className={styles.metricLabel}>Volume</span> 
          <span className={styles.metricValue}>{price.regularMarketVolume?.toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Market Cap</span>
          <span className={styles.metricValue}>{formatLargeNumber(summaryDetail.marketCap)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>P/E Ratio</span>
          <span className={styles.metricValue}>{formatNumber(summaryDetail.trailingPE)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Forward P/E</span>
          <span className={styles.metricValue}>{formatNumber(summaryDetail.forwardPE)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>P/B Ratio</span>
          <span className={styles.metricValue}>{formatNumber(keyStats.priceToBook)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>EPS (TTM)</span>
          <span className={styles.metricValue}>{formatNumber(keyStats.trailingEps)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>Dividend Yield</span>
          <span className={styles.metricValue}>{formatPercent(summaryDetail.dividendYield)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>52-Week High</span>
          <span className={styles.metricValue}>{formatNumber(summaryDetail.fiftyTwoWeekHigh)}</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricLabel}>52-Week Low</span>
          <span className={styles.metricValue}>{formatNumber(summaryDetail.fiftyTwoWeekLow)}</span>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
