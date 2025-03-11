import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';
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
  // Define performance periods
  const performancePeriodDefinitions = [
    { label: '1M', months: 1 },
    { label: '3M', months: 3 },
    { label: '6M', months: 6 },
    { label: '1Y', months: 12 },
    { label: '3Y', months: 36 },
    { label: '5Y', months: 60 },
    { label: '10Y', months: 120 },
    { label: '20Y', months: 240 },
  ];
  
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [metrics, setMetrics] = useState<PeriodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

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
  
  // Fetch real performance metrics based on the symbol
  useEffect(() => {
    if (!symbol) return;
    
    const fetchPerformanceMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const today = new Date();
        const results: PeriodData[] = [];
        
        // Fetch data for each period
        for (const period of performancePeriodDefinitions) {
          // Calculate the start date for this period
          const startDate = new Date();
          startDate.setMonth(today.getMonth() - period.months);
          
          // Format dates for API
          const fromDate = startDate.toISOString().split('T')[0];
          const toDate = today.toISOString().split('T')[0];
          
          // Determine appropriate interval based on period length
          const interval = period.months > 60 ? '1mo' : period.months > 12 ? '1wk' : '1d';
          
          // Fetch historical data from port 3001
          const response = await axios.get(`http://localhost:3001/api/finance/historical`, {
            params: {
              symbol,
              from: fromDate,
              to: toDate,
              interval
            }
          });
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Get first and last valid closing prices
            const firstValidDataPoint = response.data.find(point => point.close !== null);
            const lastValidDataPoint = [...response.data].reverse().find(point => point.close !== null);
            
            if (firstValidDataPoint && lastValidDataPoint) {
              const startPrice = firstValidDataPoint.close;
              const endPrice = lastValidDataPoint.close;
              const performanceValue = ((endPrice - startPrice) / startPrice) * 100;
              
              results.push({
                label: period.label,
                value: performanceValue,
                months: period.months
              });
            } else {
              // Handle case where we don't have valid data points
              results.push({
                label: period.label,
                value: 0,
                months: period.months
              });
            }
          } else {
            // If no data returned, add a placeholder
            results.push({
              label: period.label,
              value: 0,
              months: period.months
            });
          }
        }
        
        setMetrics(results);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        setError('Failed to load performance metrics');
      } finally {
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

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading metrics...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <h2>Performance Metrics</h2>
        <div className={styles.infoIconWrapper}>
          <button 
            className={`${styles.modernIconButton} ${showTooltip ? styles.active : ''}`}
            onClick={toggleTooltip}
            aria-label="Performance Metrics Information"
          >
            <FaQuestionCircle />
          </button>
          {showTooltip && (
            <div className={styles.tooltipContent}>
              <p>Performance metrics show the percentage change in stock value over different time periods.</p>
              <p>Select a time period to update all related charts and analyses.</p>
            </div>
          )}
        </div>
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
