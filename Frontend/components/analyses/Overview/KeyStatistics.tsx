import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';

interface KeyStatisticsProps {
  symbol: string;
}

interface StatisticsData {
  allTimeHigh: string;
  allTimeLow: string;
  profitDays: string;
  avgHoldPeriod: string;
}

const KeyStatistics: React.FC<KeyStatisticsProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [statisticsData, setStatisticsData] = useState<StatisticsData>({
    allTimeHigh: '$69,000',
    allTimeLow: '$3,200',
    profitDays: '98.7%',
    avgHoldPeriod: '2.8 Years'
  });

  useEffect(() => {
    const fetchKeyStatistics = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      
      try {
        // In a real application, you would make API calls to get actual statistics
        // For example:
        // const response = await axios.get(`http://localhost:3001/api/finance/statistics?symbol=${symbol}`);
        // setStatisticsData(response.data);
        
        // For now, simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // In a real app, you would use actual data from API
        // This is just placeholder data
        setStatisticsData({
          allTimeHigh: symbol === 'BTC-USD' ? '$69,000' : '$450.25',
          allTimeLow: symbol === 'BTC-USD' ? '$3,200' : '$12.30',
          profitDays: '98.7%',
          avgHoldPeriod: '2.8 Years'
        });
      } catch (error) {
        console.error('Error fetching key statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchKeyStatistics();
  }, [symbol]);

  if (isLoading) {
    return (
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <h2>Key Statistics</h2>
        </div>
        <div className={styles.loadingContainer}>Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <h2>Key Statistics</h2>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaArrowUp /></div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statisticsData.allTimeHigh}</div>
            <div className={styles.statLabel}>All Time High</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaArrowDown /></div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statisticsData.allTimeLow}</div>
            <div className={styles.statLabel}>All Time Low</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaChartLine /></div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statisticsData.profitDays}</div>
            <div className={styles.statLabel}>Profit Days</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaCalendarAlt /></div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statisticsData.avgHoldPeriod}</div>
            <div className={styles.statLabel}>Avg Hold Period</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyStatistics;
