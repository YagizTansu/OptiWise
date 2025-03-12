import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';
import axios from 'axios';

interface RevenueAnalysisProps {
  symbol: string;
}

interface FinancialData {
  labels: string[];
  revenue: number[];
  netIncome: number[];
  lynchRatio?: number[]; // Add Lynch ratio array
}

const RevenueAnalysis = ({ symbol }: RevenueAnalysisProps) => {
  const [timeframe, setTimeframe] = useState('annual');
  const [financialData, setFinancialData] = useState<FinancialData>({
    labels: [],
    revenue: [],
    netIncome: [],
    lynchRatio: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Determine which module to request based on timeframe
        const module = timeframe === 'annual' 
          ? 'incomeStatementHistory' 
          : 'incomeStatementHistoryQuarterly';
        
        // We need additional data for Lynch ratio calculation
        const response = await axios.get(`http://localhost:3001/api/finance/quoteSummary`, {
          params: {
            symbol: symbol,
            modules: `${module},defaultKeyStatistics,price`
          }
        });
        
        // Extract the appropriate data based on timeframe
        const statements = response.data?.incomeStatementHistory?.incomeStatementHistory || [];
        
        // Get PE ratio from defaultKeyStatistics
        const peRatio = response.data?.defaultKeyStatistics?.forwardPE?.raw || 0;
        // Get EPS growth rate
        const growthRate = response.data?.defaultKeyStatistics?.earningsGrowth?.raw * 100 || 0;
        
        // Calculate Lynch ratio: Growth Rate / PE Ratio
        const lynchRatio = growthRate > 0 && peRatio > 0 ? Number((growthRate / peRatio).toFixed(2)) : 0;
        
        if (statements.length === 0) {
          throw new Error('No financial data available');
        }
        
        // Process the data
        const processedData: FinancialData = {
          labels: [],
          revenue: [],
          netIncome: [],
          lynchRatio: []
        };
        
        // Yahoo Finance data is in reverse chronological order (newest first)
        // We'll reverse it to show oldest to newest
        const orderedStatements = [...statements].reverse();
        
        orderedStatements.forEach((statement, index) => {
          // Format date based on timeframe - endDate is already in ISO format
          const date = new Date(statement.endDate);
          const label = timeframe === 'annual' 
            ? date.getFullYear().toString()
            : `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
          
          processedData.labels.push(label);
          
          // Convert values to billions for better readability
          const totalRevenue = statement.totalRevenue
            ? Number(statement.totalRevenue) / 1_000_000_000 
            : 0;
            
          const netIncome = statement.netIncome 
            ? Number(statement.netIncome) / 1_000_000_000
            : 0;
            
          processedData.revenue.push(Number(totalRevenue.toFixed(2)));
          processedData.netIncome.push(Number(netIncome.toFixed(2)));
          
          // Add Lynch ratio for the most recent period only
          if (index === orderedStatements.length - 1) {
            processedData.lynchRatio = [lynchRatio];
          }
        });
        
        setFinancialData(processedData);
      } catch (err) {
        console.error('Error fetching financial data:', err);
        setError('Failed to load financial data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFinancialData();
  }, [symbol, timeframe]);
  
  // Prepare chart data from the fetched financial data
  const chartData = {
    labels: financialData.labels,
    datasets: [
      {
        label: 'Revenue',
        data: financialData.revenue,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
        type: 'bar' as const,
        yAxisID: 'y',
      },
      {
        label: 'Net Income',
        data: financialData.netIncome,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        type: 'bar' as const,
        yAxisID: 'y',
      }
    ]
  };

  return (
    <div className={styles.chartContainer}>
      <h3>Sales & Net Income ({timeframe === 'annual' ? 'Annual' : 'Quarterly'})</h3>
      <div className={styles.chartControls}>
        <div className={styles.timeframeToggle}>
          <button 
            className={`${styles.modernTabButton} ${timeframe === 'annual' ? styles.activeTab : ''}`}
            onClick={() => setTimeframe('annual')}
          >
            Annual
          </button>
          {/* <button 
            className={`${styles.modernTabButton} ${timeframe === 'quarterly' ? styles.activeTab : ''}`}
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </button> */}
        </div>
        {financialData.lynchRatio && financialData.lynchRatio[0] > 0 && (
          <div className={styles.lynchRatio}>
            <span className={styles.lynchLabel}>Lynch Ratio:</span>
            <span className={`${styles.lynchValue} ${financialData.lynchRatio[0] < 1 ? styles.goodValue : styles.badValue}`}>
              {financialData.lynchRatio[0].toFixed(2)}
              <span className={styles.interpretation}>
                {financialData.lynchRatio[0] < 1 ? ' (Good)' : ' (Overvalued)'}
              </span>
            </span>
          </div>
        )}
      </div>
      <div className={styles.trendChart}>
        {isLoading ? (
          <div className={styles.loadingIndicator}>Loading financial data...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : financialData.labels.length === 0 ? (
          <div className={styles.noDataMessage}>No financial data available for {symbol}</div>
        ) : (
          <Bar 
            data={chartData} 
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
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: $${context.raw} billion`;
                    }
                  }
                }
              }
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default RevenueAnalysis;
