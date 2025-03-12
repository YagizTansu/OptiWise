import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';

interface FinancialHealthProps {
  symbol: string;
}

const FinancialHealth = ({ symbol }: FinancialHealthProps) => {
  const [financialHealth, setFinancialHealth] = useState({
    altmanZScore: '12.95',
    zScoreRisk: 'Low risk of bankruptcy',
    piotroskiFScore: '8',
    beneishMScore: '-2.76',
    sharesOutstanding: {
      current: '3.21',
      trend: 'increasing'
    },
    weightedFinancials: {
      trend: 'increasing'
    }
  });

  // Chart data
  const altmanZScoreData = {
    labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023', 'Today'],
    datasets: [
      {
        label: 'Altman Z-Score',
        data: [5.6, 6.2, 7.8, 9.4, 10.8, 11.5, 12.4, 12.95],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  const sharesOutstandingData = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Shares Outstanding (Billions)',
        data: [2.58, 2.65, 2.73, 2.85, 2.92, 3.10, 3.21],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  const weightedFinancialsData = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Sales Per Share',
        data: [8.32, 9.28, 11.55, 18.88, 27.90, 31.58, 27.34],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1
      },
      {
        label: 'Net Income Per Share',
        data: [-0.38, 0.32, 0.26, 1.94, 4.30, 4.56, 3.05],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'FCF Per Share',
        data: [0.89, 0.98, 1.87, 2.47, 3.15, 3.92, 3.07],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.1
      }
    ]
  };

  // In a real app, fetch data based on symbol
  useEffect(() => {
    // Example: fetchFinancialHealthData(symbol).then(data => setFinancialHealth(data));
  }, [symbol]);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.financialHealthSection}>
          <h3>Financial Health</h3>
          <div className={styles.tabHeader}>
            <button className={`${styles.modernTabButton} ${styles.activeTab}`}>Altman Z-Score</button>
            <button className={styles.modernTabButton}>Piotroski F-Score</button>
            <button className={styles.modernTabButton}>Beneish M-Score</button>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.trendChart}>
              <Line 
                data={altmanZScoreData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Z-Score'
                      }
                    }
                  }
                }} 
              />
            </div>
            <div className={styles.scoreIndicator}>
              <span className={styles.currentScore}>Current Z-Score: {financialHealth.altmanZScore}</span>
              <span className={styles.riskLevel}>Risk: {financialHealth.zScoreRisk}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.capitalStructureSection}>
        <h3>Capital Structure</h3>
        <div className={styles.chartRow}>
          <div className={styles.chartContainer}>
            <h4>Shares Outstanding (2018-2024)</h4>
            <div className={styles.trendChart}>
              <Line 
                data={sharesOutstandingData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Billions'
                      }
                    }
                  }
                }} 
              />
            </div>
            <div className={styles.trendSummary}>
              <div className={styles.trendIndicator}>
                <span className={styles.trendLabel}>Shares Outstanding:</span>
                <span className={styles.trendValue}>
                  {financialHealth.sharesOutstanding.trend === 'increasing' ? 
                    <><FaArrowUp className={styles.trendUp} /> increasing</> : 
                    <><FaArrowDown className={styles.trendDown} /> decreasing</>}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.chartContainer}>
            <h4>Weighted Financials (per share)</h4>
            <div className={styles.trendChart}>
              <Line 
                data={weightedFinancialsData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: '$'
                      }
                    }
                  }
                }} 
              />
            </div>
            <div className={styles.trendSummary}>
              <div className={styles.trendIndicator}>
                <span className={styles.trendLabel}>Weighted Financials:</span>
                <span className={styles.trendValue}>
                  {financialHealth.weightedFinancials.trend === 'increasing' ? 
                    <><FaArrowUp className={styles.trendUp} /> increasing</> : 
                    <><FaArrowDown className={styles.trendDown} /> decreasing</>}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.companySummary}>
          <h4 className={styles.companyRatingTitle}>This company is <span className={styles.resilientRating}>Resilient</span></h4>
          <p className={styles.companyRatingDesc}>
            It is effectively managing its capital to foster growth and it rewards its investors.
          </p>
        </div>
      </div>
    </>
  );
};

export default FinancialHealth;
