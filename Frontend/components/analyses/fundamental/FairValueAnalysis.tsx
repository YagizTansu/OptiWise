import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { FaCheckSquare, FaRegSquare, FaInfoCircle } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';

interface FairValueAnalysisProps {
  symbol: string;
}

const FairValueAnalysis = ({ symbol }: FairValueAnalysisProps) => {
  const [financialData, setFinancialData] = useState({
    lastClose: '246.32',
    fairValue: '430.46'
  });
  const [valuationMethods, setValuationMethods] = useState({
    discountedCashFlow: true,
    peterLynch: true,
    economicValueAdded: true
  });
  
  const [fairValues, setFairValues] = useState({
    discountedCashFlow: '452.18',
    peterLynch: '398.75',
    economicValueAdded: '440.44'
  });

  // Calculate average fair value
  const calculateAverageFairValue = () => {
    const values = Object.values(fairValues).map(val => parseFloat(val));
    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(2);
  };

  const toggleValuationMethod = (method: keyof typeof valuationMethods) => {
    setValuationMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const fairValueData = {
    labels: ['2021', '2022', '2023', '2024', 'Today'],
    datasets: [
      {
        label: 'Price',
        data: [135, 210, 180, 230, 246.32],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Fair Value',
        data: [190, 280, 320, 380, 430.46],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  useEffect(() => {
    // Example: fetchFairValueData(symbol)
    //   .then(data => setFinancialData(data));
  }, [symbol]);

  return (
    <div className={styles.chartContainer}>
      <h3>Price & Fair Value Analysis</h3>
      <div className={styles.trendChart}>
        <Line 
          data={fairValueData} 
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
      
      <div className={styles.methodologyContainer}>
        <div className={styles.methodologyOptions}>
          <button className={styles.methodButton} onClick={() => toggleValuationMethod('discountedCashFlow')}>
            {valuationMethods.discountedCashFlow ? <FaCheckSquare /> : <FaRegSquare />} DCF
          </button>
          <button className={styles.methodButton} onClick={() => toggleValuationMethod('peterLynch')}>
            {valuationMethods.peterLynch ? <FaCheckSquare /> : <FaRegSquare />} Lynch
          </button>
          <button className={styles.methodButton} onClick={() => toggleValuationMethod('economicValueAdded')}>
            {valuationMethods.economicValueAdded ? <FaCheckSquare /> : <FaRegSquare />} EVA
          </button>
        </div>
      </div>
      
      <div className={styles.fairValueBoxesContainer}>
        <div className={styles.fairValueBox}>
          <h4>DCF</h4>
          <div className={styles.fairValueAmount}>${fairValues.discountedCashFlow}</div>
        </div>
        <div className={styles.fairValueBox}>
          <h4>Lynch</h4>
          <div className={styles.fairValueAmount}>${fairValues.peterLynch}</div>
        </div>
        <div className={styles.fairValueBox}>
          <h4>EVA</h4>
          <div className={styles.fairValueAmount}>${fairValues.economicValueAdded}</div>
        </div>
      </div>
      
      <div className={styles.averageFairValueContainer}>
        <div className={styles.averageFairValueHeader}>
          <h4>Average Fair Value <FaInfoCircle className={styles.infoIcon} /></h4>
        </div>
        
        <div className={styles.averageFairValueContent}>
          <div className={styles.averageValueBox}>
            <div className={styles.averageFairValueAmount}>
              ${calculateAverageFairValue()}
            </div>
            <div className={styles.currentPriceComparison}>
              {parseFloat(calculateAverageFairValue()) > parseFloat(financialData.lastClose) ? 
                <span className={styles.undervalued}>Undervalued by {((parseFloat(calculateAverageFairValue()) / parseFloat(financialData.lastClose) - 1) * 100).toFixed(1)}%</span> :
                <span className={styles.overvalued}>Overvalued by {((parseFloat(financialData.lastClose) / parseFloat(calculateAverageFairValue()) - 1) * 100).toFixed(1)}%</span>
              }
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.chartFooter}>
        <div className={styles.currentPrice}>
          <strong>Current price:</strong> ${financialData.lastClose}
        </div>
        <div className={styles.fairValue}>
          <strong>Fair Value:</strong> ${financialData.fairValue}
        </div>
      </div>
    </div>
  );
};

export default FairValueAnalysis;
