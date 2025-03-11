import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { FaExpand, FaQuestion } from 'react-icons/fa';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';

interface AnnualPerformanceProps {
  symbol: string;
}

const AnnualPerformance: React.FC<AnnualPerformanceProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default annual data
  const [annualData, setAnnualData] = useState({
    labels: ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
    datasets: [{
      label: 'Annual Return (%)',
      data: [12, -5, 18, 7, 22, -8, 14, -3, 25, 10, 5],
      backgroundColor: (context: { dataset: { data: { [x: string]: any; }; }; dataIndex: string | number; }) => {
        const value = context.dataset.data[context.dataIndex];
        return value >= 0 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)';
      }
    }]
  });

  const [statistics, setStatistics] = useState({
    bestYear: '2021 (+25%)',
    worstYear: '2018 (-8%)',
    average: '+8.8%'
  });

  // Fetch annual performance data
  useEffect(() => {
    const fetchAnnualData = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // This would be a real API call in a production app
        // For this example, we'll simulate a delay and use the static data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would process the API response here
        // and update the annualData state with real data
        
        // For now, we'll just use the default data
        setIsLoading(false);
        
        // Calculate statistics based on the data
        const allReturns = annualData.datasets[0].data;
        const maxReturn = Math.max(...allReturns);
        const maxIndex = allReturns.indexOf(maxReturn);
        const bestYear = annualData.labels[maxIndex];
        
        const minReturn = Math.min(...allReturns);
        const minIndex = allReturns.indexOf(minReturn);
        const worstYear = annualData.labels[minIndex];
        
        const avgReturn = allReturns.reduce((sum, val) => sum + val, 0) / allReturns.length;
        
        setStatistics({
          bestYear: `${bestYear} (+${maxReturn}%)`,
          worstYear: `${worstYear} (${minReturn}%)`,
          average: `${avgReturn > 0 ? '+' : ''}${avgReturn.toFixed(1)}%`
        });
        
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
