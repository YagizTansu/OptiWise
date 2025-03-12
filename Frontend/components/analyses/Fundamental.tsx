import { useState } from 'react';
import styles from '../../styles/Analyses.module.css';

// Import modular components
import KeyMetrics from './fundamental/KeyMetrics';
import FinancialHealth from './fundamental/FinancialHealth';
import RevenueAnalysis from './fundamental/RevenueAnalysis';
import FairValueAnalysis from './fundamental/FairValueAnalysis';

interface FundamentalProps {
  symbol: string;
}

const Fundamental = ({ symbol }: FundamentalProps) => {
  return (
    <div className={styles.fundamentalTab}>
      <KeyMetrics symbol={symbol} />
      {/* <AnalysisMethods symbol={symbol}/> */}
      <RevenueAnalysis symbol={symbol} />
      <FairValueAnalysis symbol={symbol} />
      <FinancialHealth symbol={symbol} />
    </div>
  );
};

export default Fundamental;
