import { useState, useEffect } from 'react';
import styles from '../../../styles/fundamental/StockDashboard.module.css';
import { fetchStockDashboardData, QuoteSummaryData } from '../../../services/api/finance';
import { FaQuestion } from 'react-icons/fa';

interface StockDashboardProps {
  symbol: string;
}

const StockDashboard = ({ symbol }: StockDashboardProps) => {
  const [data, setData] = useState<QuoteSummaryData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

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
      }
    };

    if (symbol) fetchData();
  }, [symbol]);

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (error || !data.price) return <div className={styles.error}>{error || 'No data available'}</div>;

  const formatNumber = (num: number, decimals = 2) => num ? num.toFixed(decimals) : 'N/A';
  const formatPercent = (num: number) => num ? `${(num * 100).toFixed(2)}%` : 'N/A';
  const formatLargeNumber = (num: number) => {
    if (!num) return 'N/A';
    if (num >= 1.0e9) return `$${(num / 1.0e9).toFixed(2)}B`;
    if (num >= 1.0e6) return `$${(num / 1.0e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const price = data.price;
  const summaryDetail = data.summaryDetail || {};
  const keyStats = data.defaultKeyStatistics || {};
  const isPositiveChange = price.regularMarketChange > 0;

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h3>{price.shortName || price.longName}</h3>
        <button 
          className={styles.iconBtn}
          onClick={() => setShowInfoModal(true)}
          aria-label="Information"
        >
          <FaQuestion />
        </button>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className={styles.modal} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Metrics Guide</h3>
              <button onClick={() => setShowInfoModal(false)}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Current Price:</strong> Latest price of the stock</p>
              <p><strong>Market Cap:</strong> Total market value of shares</p>
              <p><strong>P/E:</strong> Price to earnings ratio</p>
              <p><strong>EPS:</strong> Earnings per share</p>
              <p><strong>Dividend:</strong> Annual dividend yield</p>
            </div>
          </div>
        </div>
      )}

      {/* Price */}
      <div className={styles.priceDisplay}>
        <div className={styles.price}>
          {price.regularMarketPrice?.toFixed(2)} {price.currency}
        </div>
        <div className={`${styles.change} ${isPositiveChange ? styles.positive : styles.negative}`}>
          {isPositiveChange ? '+' : ''}{price.regularMarketChange?.toFixed(2)} ({formatPercent(price.regularMarketChangePercent)})
        </div>
      </div>
      
      {/* Trading Details */}
      <div className={styles.tradeInfo}>
        <div className={styles.infoRow}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Open</span> 
            <span>{price.regularMarketOpen?.toFixed(2)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>High</span> 
            <span>{price.regularMarketDayHigh?.toFixed(2)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Low</span> 
            <span>{price.regularMarketDayLow?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.label}>Market Cap</span>
          <span>{formatLargeNumber(summaryDetail.marketCap)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>P/E</span>
          <span>{formatNumber(summaryDetail.trailingPE)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>EPS</span>
          <span>{formatNumber(keyStats.trailingEps)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Dividend</span>
          <span>{formatPercent(summaryDetail.dividendYield)}</span>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
