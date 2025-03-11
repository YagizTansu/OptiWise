import React from 'react';
import styles from '../../styles/Analyses.module.css';

// Import new components
import PerformanceOverview from './Overview/PerformanceOverview';
import PerformanceMetrics from './Overview/PerformanceMetrics';
import AnnualPerformance from './Overview/AnnualPerformance';
import KeyStatistics from './Overview/KeyStatistics';
import Dividends from './Overview/Dividends'; // Ensure this path is correct or update it to the correct path

interface OverviewProps {
  symbol: string;
}

const Overview: React.FC<OverviewProps> = ({ symbol }) => {
  return (
    <div className={styles.overviewTab}>
      {/* Performance Overview Component */}
      <PerformanceOverview symbol={symbol} />

      {/* Performance Metrics Component */}
      <PerformanceMetrics symbol={symbol} />

      {/* Annual Performance Component */}
      <AnnualPerformance symbol={symbol} />
      
      {/* Key Statistics Component */}
      <KeyStatistics symbol={symbol} />
      
      {/* Dividends Component */}
      <Dividends symbol={symbol} />
    </div>
  );
};

export default Overview;
