import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { FaExpand, FaQuestion } from 'react-icons/fa';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';

interface AnnualPerformanceProps {
  symbol: string;
}

interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

const AnnualPerformance: React.FC<AnnualPerformanceProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default annual data structure (will be populated with real data)
  const [annualData, setAnnualData] = useState({
    labels: [] as string[],
    datasets: [{
      label: 'Annual Return (%)',
      data: [] as number[],
      backgroundColor: (context: { dataset: { data: { [x: string]: any; }; }; dataIndex: string | number; }) => {
        const value = context.dataset.data[context.dataIndex];
        return value >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)';
      }
    }]
  });

  const [statistics, setStatistics] = useState({
    bestYear: '',
    worstYear: '',
    average: ''
  });

  // Calculate annual performance from historical data
  const calculateAnnualReturns = (historicalData: HistoricalDataPoint[]) => {
    // Group data by year
    const dataByYear = historicalData.reduce((acc, dataPoint) => {
      const year = new Date(dataPoint.date).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(dataPoint);
      return acc;
    }, {} as Record<number, HistoricalDataPoint[]>);

    // Sort years in ascending order
    const sortedYears = Object.keys(dataByYear)
      .map(Number)
      .sort((a, b) => a - b);

    // Get the most recent year data that has at least some entries
    // This handles partial current year data
    if (sortedYears.length > 0) {
      const currentYear = new Date().getFullYear();
      if (dataByYear[currentYear] && dataByYear[currentYear].length < 5) {
        // If we have very few data points for current year, exclude it
        sortedYears.pop();
      }
    }

    // Calculate returns between consecutive year-end prices
    const annualReturns: number[] = [];
    const yearLabels: string[] = [];
    
    for (let i = 1; i < sortedYears.length; i++) {
      const previousYear = sortedYears[i-1];
      const currentYear = sortedYears[i];
      
      // Get the last data point (year-end) for each year
      const previousYearEnd = dataByYear[previousYear].slice(-1)[0].adjClose;
      const currentYearEnd = dataByYear[currentYear].slice(-1)[0].adjClose;
      
      // Calculate percentage return
      const annualReturn = ((currentYearEnd - previousYearEnd) / previousYearEnd) * 100;
      annualReturns.push(parseFloat(annualReturn.toFixed(2)));
      yearLabels.push(currentYear.toString());
    }

    return {
      labels: yearLabels,
      returns: annualReturns
    };
  };

  // Fetch annual performance data
  useEffect(() => {
    const fetchAnnualData = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate a start date 10 years ago from today
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 30);
        
        // Format dates as ISO strings
        const fromDate = startDate.toISOString();
        const toDate = endDate.toISOString();
        
        // Call the historical API with monthly data using port 3001
        const response = await axios.get(`http://localhost:3001/api/finance/historical`, {
          params: {
            symbol: symbol,
            from: fromDate,
            to: toDate,
            interval: '1mo'
          }
        });
        
        if (!response.data || !response.data.length) {
          throw new Error('No historical data available');
        }
        
        // Calculate annual returns from monthly data
        const calculatedData = calculateAnnualReturns(response.data);
        
        // Update chart data
        setAnnualData({
          labels: calculatedData.labels,
          datasets: [{
            label: 'Annual Return (%)',
            data: calculatedData.returns,
            backgroundColor: (context: { dataset: { data: { [x: string]: any; }; }; dataIndex: string | number; }) => {
              const value = context.dataset.data[context.dataIndex];
              return value >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)';
            }
          }]
        });
        
        // Calculate statistics based on the real data
        const allReturns = calculatedData.returns;
        if (allReturns.length > 0) {
          const maxReturn = Math.max(...allReturns);
          const maxIndex = allReturns.indexOf(maxReturn);
          const bestYear = calculatedData.labels[maxIndex];
          
          const minReturn = Math.min(...allReturns);
          const minIndex = allReturns.indexOf(minReturn);
          const worstYear = calculatedData.labels[minIndex];
          
          const avgReturn = allReturns.reduce((sum, val) => sum + val, 0) / allReturns.length;
          
          setStatistics({
            bestYear: `${bestYear} (+${maxReturn.toFixed(1)}%)`,
            worstYear: `${worstYear} (${minReturn >= 0 ? '+' : ''}${minReturn.toFixed(1)}%)`,
            average: `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%`
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching annual performance data:', err);
        setError('Failed to load annual performance data');
        setIsLoading(false);
      }
    };
    
    fetchAnnualData();
  }, [symbol]);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h2>Annual Performance</h2>
        <div className={styles.chartControls}>
          <button className={styles.modernIconButton} title="Fullscreen">
            <FaExpand />
          </button>
          <button className={styles.modernIconButton} title="Learn More">
            <FaQuestion />
          </button>
        </div>
      </div>
      <div className={styles.annualChart}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading annual data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : (
          <Bar 
            data={annualData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  grid: {
                    color: 'rgba(200, 200, 200, 0.1)'
                  },
                  title: {
                    display: true,
                    text: 'Annual Return (%)',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 13
                  }
                }
              }
            }}
            height={300}
          />
        )}
      </div>
      <div className={styles.chartSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Best Year:</span>
          <span className={styles.summaryValue}>{statistics.bestYear}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Worst Year:</span>
          <span className={styles.summaryValue}>{statistics.worstYear}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Average:</span>
          <span className={styles.summaryValue}>{statistics.average}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnualPerformance;
