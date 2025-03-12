import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';

interface RevenueAnalysisProps {
  symbol: string;
}

const RevenueAnalysis = ({ symbol }: RevenueAnalysisProps) => {
  const [timeframe, setTimeframe] = useState('annual');

  // Chart data
  const revenueNetIncomeData = {
    labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Revenue',
        data: [11.76, 21.46, 24.58, 31.54, 53.82, 81.46, 97.89, 87.76],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
        type: 'bar' as const,
        yAxisID: 'y',
      },
      {
        label: 'Net Income',
        data: [-1.96, -0.98, 0.86, 0.72, 5.52, 12.56, 14.12, 9.78],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        type: 'bar' as const,
        yAxisID: 'y',
      }
    ]
  };

  // In a real app, fetch data based on symbol and timeframe
  useEffect(() => {
    // Example: fetchRevenueData(symbol, timeframe)
    //   .then(data => setChartData(data));
  }, [symbol, timeframe]);

  return (
    <div className={styles.chartContainer}>
      <h3>Sales & Net Income (2017-2024)</h3>
      <div className={styles.chartControls}>
        <div className={styles.timeframeToggle}>
          <button 
            className={`${styles.modernTabButton} ${timeframe === 'annual' ? styles.activeTab : ''}`}
            onClick={() => setTimeframe('annual')}
          >
            Annual
          </button>
          <button 
            className={`${styles.modernTabButton} ${timeframe === 'quarterly' ? styles.activeTab : ''}`}
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </button>
        </div>
      </div>
      <div className={styles.trendChart}>
        <Bar 
          data={revenueNetIncomeData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Billion $'
                }
              }
            }
          }} 
        />
      </div>
    </div>
  );
};

export default RevenueAnalysis;
