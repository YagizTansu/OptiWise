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

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

const KeyStatistics: React.FC<KeyStatisticsProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [statisticsData, setStatisticsData] = useState<StatisticsData>({
    allTimeHigh: '0',
    allTimeLow: '0',
    profitDays: '0%',
    avgHoldPeriod: '0 Years'
  });

  useEffect(() => {
    const fetchKeyStatistics = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      
      try {
        // Get maximum historical data (we'll use 20 years)
        const twentyYearsAgo = new Date();
        twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
        
        const response = await axios.get(`http://localhost:3001/api/finance/historical`, {
          params: {
            symbol: symbol,
            from: twentyYearsAgo.toISOString(),
            to: new Date().toISOString(),
            interval: '1d'
          }
        });
        
        // Process the historical data to calculate statistics
        if (response.data && Array.isArray(response.data)) {
          const historicalData: HistoricalDataPoint[] = response.data;
          
          // Calculate All-Time High and All-Time Low
          let allTimeHigh = Math.max(...historicalData.map(point => point.high));
          let allTimeLow = Math.min(...historicalData.map(point => point.low));
          
          // Calculate Profit Days (days where close > open)
          const profitDays = historicalData.filter(point => point.close > point.open).length;
          const profitPercentage = (profitDays / historicalData.length) * 100;
          
          // Calculate Average Hold Period
          // For this simplified version, we'll estimate based on profitable stretches
          let totalHoldDays = 0;
          let holdPeriods = 0;
          let inProfitPeriod = false;
          let currentHoldDays = 0;
          
          historicalData.forEach((point, index) => {
            if (index > 0) {
              const isUpDay = point.close > point.open;
              
              if (isUpDay && !inProfitPeriod) {
                // Starting a new profit period
                inProfitPeriod = true;
                currentHoldDays = 1;
              } else if (isUpDay && inProfitPeriod) {
                // Continuing profit period
                currentHoldDays++;
              } else if (!isUpDay && inProfitPeriod) {
                // End of profit period
                inProfitPeriod = false;
                totalHoldDays += currentHoldDays;
                holdPeriods++;
                currentHoldDays = 0;
              }
            }
          });
          
          // If we're still in a profit period at the end
          if (inProfitPeriod && currentHoldDays > 0) {
            totalHoldDays += currentHoldDays;
            holdPeriods++;
          }
          
          const avgHoldDays = holdPeriods > 0 ? totalHoldDays / holdPeriods : 0;
          const avgHoldYears = avgHoldDays / 365;
          
          // Format the data
          const currencyFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
          
          setStatisticsData({
            allTimeHigh: currencyFormatter.format(allTimeHigh),
            allTimeLow: currencyFormatter.format(allTimeLow),
            profitDays: `${profitPercentage.toFixed(1)}%`,
            avgHoldPeriod: `${avgHoldYears.toFixed(1)} Years`
          });
        }
      } catch (error) {
        console.error('Error fetching key statistics:', error);
        // Set default values in case of error
        setStatisticsData({
          allTimeHigh: 'N/A',
          allTimeLow: 'N/A',
          profitDays: 'N/A',
          avgHoldPeriod: 'N/A'
        });
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
