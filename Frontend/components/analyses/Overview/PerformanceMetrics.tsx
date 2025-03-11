import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';

interface PeriodData {
  label: string;
  value: number;
  months: number;
}

interface PerformanceMetricsProps {
  symbol: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ symbol }) => {
  // Performance periods data
  const performancePeriods = [
    { label: '1M', value: -2.5, months: 1 },
    { label: '3M', value: 5.7, months: 3 },
    { label: '6M', value: 12.3, months: 6 },
    { label: '1Y', value: -8.2, months: 12 },
    { label: '3Y', value: 45.6, months: 36 },
    { label: '5Y', value: 78.2, months: 60 },
    { label: '10Y', value: 134.5, months: 120 },
    { label: '20Y', value: 267.8, months: 240 },
  ];
  
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [metrics, setMetrics] = useState<PeriodData[]>(performancePeriods);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for period changes from other components
  useEffect(() => {
    const handlePeriodChange = (event: CustomEvent) => {
      setSelectedPeriod(event.detail);
    };
    
    document.addEventListener('periodChange', handlePeriodChange as EventListener);
    
    return () => {
      document.removeEventListener('periodChange', handlePeriodChange as EventListener);
    };
  }, []);
  
  // In a real app, you would fetch actual metrics based on the symbol
  useEffect(() => {
    if (!symbol) return;
    
    // Example of how you might fetch performance metrics
    // This is a placeholder - replace with real API call
    const fetchPerformanceMetrics = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would make API calls to get real performance data
        // For now, we'll use the static data with a simulated delay
        setTimeout(() => {
          // In a real app, you might modify this with actual data from an API
          setMetrics(performancePeriods);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        setIsLoading(false);
      }
    };
    
    fetchPerformanceMetrics();
  }, [symbol]);
  
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Notify other components about period change
    document.dispatchEvent(new CustomEvent('periodChange', { detail: period }));
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading metrics...</div>;
  }

  return (
    <div className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <h2>Performance Metrics</h2>
        <button className={styles.modernIconButton} title="Learn About Performance Metrics">
          <FaInfoCircle />
        </button>
      </div>
      <div className={styles.metricsGrid}>
        {metrics.map((period) => (
          <div 
            key={period.label} 
            className={`${styles.metricCard} ${period.value >= 0 ? styles.positive : styles.negative} ${selectedPeriod === period.label ? styles.selectedPeriod : ''}`}
            onClick={() => handlePeriodChange(period.label)}
          >
            <div className={styles.metricHeader}>
              <span className={styles.periodLabel}>{period.label}</span>
              {selectedPeriod === period.label && <span className={styles.activeBadge}>Active</span>}
            </div>
            <div className={styles.returnValue}>
              {period.value >= 0 ? <FaArrowUp className={styles.upIcon} /> : <FaArrowDown className={styles.downIcon} />}
              <span>{Math.abs(period.value).toFixed(1)}%</span>
            </div>
            <div className={styles.metricFooter}>
              <span>vs. previous</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceMetrics;
