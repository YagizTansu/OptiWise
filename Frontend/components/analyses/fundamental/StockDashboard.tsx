import { useState, useEffect } from 'react';
import styles from '../../../styles/fundamental/StockDashboard.module.css';
import { fetchStockDashboardData, QuoteSummaryData } from '../../../services/api/finance';
import { FaExpand, FaQuestion, FaDownload, FaCompress, FaInfoCircle, FaTimes } from 'react-icons/fa';

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
    <div className={styles.dashboardContainer}>
      {/* Dashboard Header */}
      <div className={styles.dashboardHeader}>
        <h3 className={styles.stockName}>{price.shortName || price.longName}</h3>
        <div className={styles.dashboardControls}>
          <button 
            className={styles.iconButton} 
            title="Learn More"
            onClick={() => setShowInfoModal(true)}
          >
            <FaQuestion />
          </button>
        </div>
      </div>

      {/* Information Modal */}
      {showInfoModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderBar}>
              <h3 className={styles.modalTitle}>Stock Metrics Explained</h3>
              <button 
                className={styles.modalCloseButton}
                onClick={() => setShowInfoModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.infoSection}>
                <h4 className={styles.infoSectionTitle}>Price Display</h4>
                <p><strong>Current Price:</strong> The latest market price of the stock.</p>
                <p><strong>Change:</strong> The price change and percentage change since previous close.</p>
              </div>
              
              <div className={styles.infoSection}>
                <h4 className={styles.infoSectionTitle}>Trading Details</h4>
                <p><strong>Open:</strong> The price at which the stock started trading when the market opened.</p>
                <p><strong>High:</strong> The highest price the stock reached during the current trading day.</p>
                <p><strong>Low:</strong> The lowest price the stock reached during the current trading day.</p>
                <p><strong>Prev Close:</strong> The stock's closing price from the previous trading day.</p>
                <p><strong>Volume:</strong> The number of shares traded during the current trading day.</p>
              </div>
              
              <div className={styles.infoSection}>
                <h4 className={styles.infoSectionTitle}>Key Financial Metrics</h4>
                <p><strong>Market Cap:</strong> The total market value of the company's outstanding shares.</p>
                <p><strong>P/E Ratio:</strong> Price-to-Earnings ratio - compares the current share price to its per-share earnings.</p>
                <p><strong>Forward P/E:</strong> Price-to-Earnings ratio based on forecasted earnings.</p>
                <p><strong>P/B Ratio:</strong> Price-to-Book ratio - compares a company's market value to its book value.</p>
                <p><strong>EPS (TTM):</strong> Earnings Per Share over the Trailing Twelve Months.</p>
                <p><strong>Dividend Yield:</strong> The dividend payment as a percentage of the stock price.</p>
                <p><strong>52-Week High/Low:</strong> The highest and lowest price points over the past 52 weeks.</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.primaryButton}
                onClick={() => setShowInfoModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Price Display */}
      <div className={styles.priceCard}>
        <div className={styles.currentPrice}>
          {price.regularMarketPrice?.toFixed(2)} {price.currency}
        </div>
        <div className={`${styles.priceChange} ${isPositiveChange ? styles.positive : styles.negative}`}>
          {isPositiveChange ? '+' : ''}{price.regularMarketChange?.toFixed(2)} ({formatPercent(price.regularMarketChangePercent)})
        </div>
      </div>
      
      {/* Trading Information */}
      <div className={styles.tradingInfoCard}>
        <div className={styles.tradingInfoRow}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Open</span> 
            <span className={styles.infoValue}>{price.regularMarketOpen?.toFixed(2)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>High</span> 
            <span className={styles.infoValue}>{price.regularMarketDayHigh?.toFixed(2)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Low</span> 
            <span className={styles.infoValue}>{price.regularMarketDayLow?.toFixed(2)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Prev Close</span> 
            <span className={styles.infoValue}>{price.regularMarketPreviousClose?.toFixed(2)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Volume</span> 
            <span className={styles.infoValue}>{price.regularMarketVolume?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className={styles.metricsCard}>
        <div className={styles.metricsGrid}>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>Market Cap</span>
            <span className={styles.metricValue}>{formatLargeNumber(summaryDetail.marketCap)}</span>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>P/E Ratio</span>
            <span className={styles.metricValue}>{formatNumber(summaryDetail.trailingPE)}</span>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>Forward P/E</span>
            <span className={styles.metricValue}>{formatNumber(summaryDetail.forwardPE)}</span>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>P/B Ratio</span>
            <span className={styles.metricValue}>{formatNumber(keyStats.priceToBook)}</span>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>EPS (TTM)</span>
            <span className={styles.metricValue}>{formatNumber(keyStats.trailingEps)}</span>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>Dividend Yield</span>
            <span className={styles.metricValue}>{formatPercent(summaryDetail.dividendYield)}</span>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>52-Week High</span>
            <span className={styles.metricValue}>{formatNumber(summaryDetail.fiftyTwoWeekHigh)}</span>
          </div>
          <div className={styles.metricTile}>
            <span className={styles.metricLabel}>52-Week Low</span>
            <span className={styles.metricValue}>{formatNumber(summaryDetail.fiftyTwoWeekLow)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
