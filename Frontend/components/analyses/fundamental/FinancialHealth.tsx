import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';
import axios from 'axios';

interface FinancialHealthProps {
  symbol: string;
}

type TabType = 'altmanZ' | 'piotroskiF' | 'beneishM';

const FinancialHealth = ({ symbol }: FinancialHealthProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('altmanZ');
  const [loading, setLoading] = useState(false);
  const [financialHealth, setFinancialHealth] = useState({
    altmanZScore: {
      current: '0',
      risk: 'Loading...',
      history: [] as {year: string, value: number}[]
    },
    piotroskiFScore: {
      current: '0',
      history: [] as {year: string, value: number}[]
    },
    beneishMScore: {
      current: '0',
      isManipulated: false,
      history: [] as {year: string, value: number}[]
    },
    sharesOutstanding: {
      current: '0',
      trend: 'stable',
      history: [] as {year: string, value: number}[]
    },
    weightedFinancials: {
      trend: 'stable',
      history: {
        salesPerShare: [] as {year: string, value: number}[],
        netIncomePerShare: [] as {year: string, value: number}[],
        fcfPerShare: [] as {year: string, value: number}[]
      }
    }
  });
  
  const [sharesOutstandingData, setSharesOutstandingData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Shares Outstanding (Billions)',
        data: [] as number[],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.1,
        fill: true
      }
    ]
  });
  
  const [weightedFinancialsData, setWeightedFinancialsData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Sales Per Share',
        data: [] as number[],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1
      },
      {
        label: 'Net Income Per Share',
        data: [] as number[],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'FCF Per Share',
        data: [] as number[],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.1
      }
    ]
  });

  // Helper function to determine Z-Score commentary
  const getZScoreCommentary = (zScore: number): string => {
    if (zScore > 2.99) {
      return 'The company has strong financial health with low bankruptcy risk in the foreseeable future. This indicates effective management of assets, liabilities, and earnings.';
    } else if (zScore > 1.8) {
      return 'The company is in a "gray area" regarding financial health. While not in immediate danger, management should address potential vulnerabilities to improve financial stability.';
    } else {
      return 'The company shows significant financial distress signals and has a higher risk of bankruptcy in the next 1-2 years. Immediate financial restructuring may be necessary.';
    }
  };

  // Helper function to determine F-Score commentary
  const getFScoreCommentary = (fScore: number): string => {
    if (fScore >= 8) {
      return 'Excellent financial health with strong profitability, improving efficiency, and solid balance sheet strength. This company demonstrates superior financial performance across multiple aspects of its operations.';
    } else if (fScore >= 5) {
      return 'Adequate financial performance with some positive indicators. There is room for improvement in certain aspects of profitability, leverage, or operating efficiency.';
    } else {
      return 'Poor financial health with multiple warning signs. The company is exhibiting weakness in profitability, balance sheet structure, or operational efficiency that require urgent attention.';
    }
  };

  // Helper function to determine M-Score commentary
  const getMScoreCommentary = (mScore: number): string => {
    if (mScore > -1.78) {
      return 'Warning: The financial statements show patterns consistent with potential earnings manipulation. The high M-Score suggests accounting practices that may be designed to overstate financial performance.';
    } else if (mScore > -2.22) {
      return 'Caution: Some earnings manipulation indicators are present, though not at the highest levels of concern. Closer examination of accounting practices and one-time items is recommended.';
    } else {
      return 'The financial statements show low probability of earnings manipulation. The company appears to be reporting results that fairly and accurately reflect its financial reality.';
    }
  };

  // Get score class based on value
  const getScoreClass = (scoreType: TabType, value: number): string => {
    if (scoreType === 'altmanZ') {
      if (value > 3) return styles.scoreHigh;
      if (value > 1.8) return styles.scoreMedium;
      return styles.scoreLow;
    } else if (scoreType === 'piotroskiF') {
      if (value >= 8) return styles.scoreHigh;
      if (value >= 5) return styles.scoreMedium;
      return styles.scoreLow;
    } else { // beneishM
      if (value < -2.22) return styles.scoreHigh;
      if (value < -1.78) return styles.scoreMedium;
      return styles.scoreLow;
    }
  };

  // Get icon based on score
  const getScoreIcon = (scoreType: TabType, value: number) => {
    if (scoreType === 'altmanZ') {
      if (value > 3) return <FaCheckCircle className={styles.iconGood} />;
      if (value > 1.8) return <FaExclamationTriangle className={styles.iconNeutral} />;
      return <FaTimesCircle className={styles.iconBad} />;
    } else if (scoreType === 'piotroskiF') {
      if (value >= 8) return <FaCheckCircle className={styles.iconGood} />;
      if (value >= 5) return <FaExclamationTriangle className={styles.iconNeutral} />;
      return <FaTimesCircle className={styles.iconBad} />;
    } else { // beneishM
      if (value < -2.22) return <FaCheckCircle className={styles.iconGood} />;
      if (value < -1.78) return <FaExclamationTriangle className={styles.iconNeutral} />;
      return <FaTimesCircle className={styles.iconBad} />;
    }
  };

  // Get current score info based on active tab
  const getCurrentScoreInfo = () => {
    if (activeTab === 'altmanZ') {
      const scoreValue = parseFloat(financialHealth.altmanZScore.current);
      return {
        name: 'Altman Z-Score',
        label: 'Z-Score:',
        value: financialHealth.altmanZScore.current,
        risk: financialHealth.altmanZScore.risk,
        commentary: getZScoreCommentary(scoreValue),
        className: getScoreClass('altmanZ', scoreValue),
        icon: getScoreIcon('altmanZ', scoreValue),
        scaleRanges: [
          { value: '>3', label: 'Safe', color: '#059669' },
          { value: '1.8-3', label: 'Gray Zone', color: '#d97706' },
          { value: '<1.8', label: 'Distress', color: '#dc2626' }
        ]
      };
    } else if (activeTab === 'piotroskiF') {
      const scoreValue = parseInt(financialHealth.piotroskiFScore.current) || 0;
      return {
        name: 'Piotroski F-Score',
        label: 'F-Score:',
        value: financialHealth.piotroskiFScore.current,
        risk: scoreValue > 5 ? 'Financially strong company' : 'Potential financial weaknesses',
        commentary: getFScoreCommentary(scoreValue),
        className: getScoreClass('piotroskiF', scoreValue),
        icon: getScoreIcon('piotroskiF', scoreValue),
        scaleRanges: [
          { value: '8-9', label: 'Strong', color: '#059669' },
          { value: '5-7', label: 'Moderate', color: '#d97706' },
          { value: '0-4', label: 'Weak', color: '#dc2626' }
        ]
      };
    } else { // beneishM
      const scoreValue = parseFloat(financialHealth.beneishMScore.current);
      return {
        name: 'Beneish M-Score',
        label: 'M-Score:',
        value: financialHealth.beneishMScore.current,
        risk: financialHealth.beneishMScore.isManipulated ? 'Potential earnings manipulation' : 'No signs of earnings manipulation',
        commentary: getMScoreCommentary(scoreValue),
        className: getScoreClass('beneishM', scoreValue),
        icon: getScoreIcon('beneishM', scoreValue),
        scaleRanges: [
          { value: '<-2.22', label: 'Low Risk', color: '#059669' },
          { value: '-2.22 to -1.78', label: 'Moderate', color: '#d97706' },
          { value: '>-1.78', label: 'High Risk', color: '#dc2626' }
        ]
      };
    }
  };

  // Fetch financial data from backend
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Use the quoteSummary endpoint to get financial data
        const response = await axios.get(`http://localhost:3001/api/finance/quoteSummary`, {
          params: {
            symbol: symbol,
            modules: 'financialData,defaultKeyStatistics,balanceSheetHistory,cashflowStatementHistory,incomeStatementHistory'
          }
        });
        
        const data = response.data;
        
        // Extract relevant data to calculate financial health metrics
        if (data) {
          // Direct access to financial data without quoteSummary.result wrapper
          const balanceSheetStatements = data.balanceSheetHistory?.balanceSheetStatements || [];
          const incomeStatements = data.incomeStatementHistory?.incomeStatementHistory || [];
          const cashflowStatements = data.cashflowStatementHistory?.cashflowStatements || [];
          const keyStats = data.defaultKeyStatistics || {};
          
          // Extract most recent statements (first in the array)
          const balanceSheet = balanceSheetStatements.length > 0 ? balanceSheetStatements[0] : {};
          const incomeStatement = incomeStatements.length > 0 ? incomeStatements[0] : {};
          const cashflowStatement = cashflowStatements.length > 0 ? cashflowStatements[0] : {};
          
          // Extract shares outstanding
          const sharesOutstandingData = keyStats.sharesOutstanding || 0;
          const sharesOutstandingInBillions = sharesOutstandingData / 1000000000;
                    
          // Simplified Z-Score calculation (not accurate, just for demo)
          // Z = 1.2(Working Capital/Total Assets) + 1.4(Retained Earnings/Total Assets) + 3.3(EBIT/Total Assets) + 0.6(Market Value of Equity/Book Value of Total Liabilities) + 1.0(Sales/Total Assets)
          const totalAssets = balanceSheet.totalAssets || 1;
          const workingCapital = (balanceSheet.totalCurrentAssets || 0) - (balanceSheet.totalCurrentLiabilities || 0);
          const ebit = incomeStatement.ebit || 0;
          const revenue = incomeStatement.totalRevenue || 0;
          const marketCap = keyStats.marketCap || 0;
          const totalLiabilities = balanceSheet.totalLiab|| 1;
          
          debugger
          // This is a very simplified calculation and not accurate for real analysis
          const zScore = (1.2 * (workingCapital / totalAssets)) + 
                          (1.4 * ((balanceSheet.retainedEarnings || 0) / totalAssets)) + 
                          (3.3 * (ebit / totalAssets)) + 
                          (0.6 * (marketCap / totalLiabilities)) + 
                          (1.0 * (revenue / totalAssets));
          
          // Simplified Piotroski F-Score (0-9 scale)
          // In reality, this would be calculated using specific financial indicators
          const profitability = (incomeStatement.netIncome || 0) > 0 ? 1 : 0;
          const operatingCashFlow = (cashflowStatement.totalCashFromOperatingActivities || 0) > 0 ? 1 : 0;
          // Add more F-score components for a real calculation
          const fScore = profitability + operatingCashFlow + 5; // Adding 5 just for demo to get a value between 0-9
          
          // Simplified Beneish M-Score
          // In reality, requires several specific financial ratios
          const mScore = -2.22 - (0.1 * ((incomeStatement.netIncome || 0) / revenue));
          
          // Create history arrays for charts (simplified)
          const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
          const sharesHistory = years.map((year, index) => ({
            year,
            value: sharesOutstandingInBillions * (0.95 + 0.05 * index) // Simulate small increases each year
          }));
          
          // Update financial health state with calculated values
          setFinancialHealth({
            altmanZScore: {
              current: zScore.toFixed(2),
              risk: zScore > 2.99 ? 'Low risk of bankruptcy' : 
                    zScore > 1.8 ? 'Gray zone' : 'High risk of bankruptcy',
              history: years.map((year, i) => ({ year, value: parseFloat(zScore.toFixed(2)) * (0.85 + 0.05 * i) }))
            },
            piotroskiFScore: {
              current: fScore.toString(),
              history: years.map((year, i) => ({ year, value: Math.min(9, Math.max(0, fScore - 1 + i % 3)) }))
            },
            beneishMScore: {
              current: mScore.toFixed(2),
              isManipulated: mScore > -1.78,
              history: years.map((year, i) => ({ year, value: mScore * (1 - 0.05 * i) }))
            },
            sharesOutstanding: {
              current: sharesOutstandingInBillions.toFixed(2),
              trend: sharesHistory[sharesHistory.length - 1].value > sharesHistory[0].value ? 'increasing' : 'decreasing',
              history: sharesHistory
            },
            weightedFinancials: {
              trend: 'increasing',
              history: {
                salesPerShare: years.map((year, i) => ({ 
                  year, 
                  value: (revenue / (sharesOutstandingData || 1)) * (0.85 + 0.05 * i) / 1000 
                })),
                netIncomePerShare: years.map((year, i) => ({ 
                  year, 
                  value: (incomeStatement.netIncome || 0) / (sharesOutstandingData || 1) * (0.85 + 0.05 * i) / 1000
                })),
                fcfPerShare: years.map((year, i) => ({ 
                  year, 
                  value: ((cashflowStatement.totalCashFromOperatingActivities || 0) - 
                         (cashflowStatement.capitalExpenditures || 0)) / 
                         (sharesOutstandingData || 1) * (0.85 + 0.05 * i) / 1000
                }))
              }
            }
          });
          
          // Update chart data
          setSharesOutstandingData({
            labels: years,
            datasets: [{
              label: 'Shares Outstanding (Billions)',
              data: sharesHistory.map(item => item.value),
              borderColor: 'rgb(153, 102, 255)',
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              tension: 0.1,
              fill: true
            }]
          });
          
          setWeightedFinancialsData({
            labels: years,
            datasets: [
              {
                label: 'Sales Per Share',
                data: years.map((year, i) => (revenue / (sharesOutstandingData || 1)) * (0.85 + 0.05 * i) / 1000),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                tension: 0.1
              },
              {
                label: 'Net Income Per Share',
                data: years.map((year, i) => (incomeStatement.netIncome || 0) / (sharesOutstandingData || 1) * (0.85 + 0.05 * i) / 1000),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
              },
              {
                label: 'FCF Per Share',
                data: years.map((year, i) => ((cashflowStatement.totalCashFromOperatingActivities || 0) - 
                      (cashflowStatement.capitalExpenditures || 0)) / 
                      (sharesOutstandingData || 1) * (0.85 + 0.05 * i) / 1000),
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                tension: 0.1
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching financial health data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchFinancialData();
    }
  }, [symbol]);

  const currentScoreInfo = getCurrentScoreInfo();

  return (
    <>
      <div className={styles.card}>
        <div className={styles.financialHealthSection}>
          <h3>Financial Health</h3>
          
          <div className={styles.tabContentWrapper}>
            <div className={styles.tabHeader}>
              <button 
                className={`${styles.modernTabButton} ${activeTab === 'altmanZ' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('altmanZ')}
              >
                Altman Z-Score
              </button>
              <button 
                className={`${styles.modernTabButton} ${activeTab === 'piotroskiF' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('piotroskiF')}
              >
                Piotroski F-Score
              </button>
              <button 
                className={`${styles.modernTabButton} ${activeTab === 'beneishM' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('beneishM')}
              >
                Beneish M-Score
              </button>
            </div>

            {loading ? (
              <div className={styles.loadingIndicator}>Loading financial health data...</div>
            ) : (
              <div className={styles.scoreCardContainer}>
                <div className={styles.scoreHeader}>
                  <h4>{currentScoreInfo.name} {currentScoreInfo.scale}</h4>
                </div>
                <div className={`${styles.scoreBox} ${currentScoreInfo.className}`}>
                  <div className={styles.scoreValue}>
                    {currentScoreInfo.icon}
                    <span>{currentScoreInfo.value}</span>
                  </div>
                  <div className={styles.scoreRisk}>
                    <strong>Risk Assessment:</strong> {currentScoreInfo.risk}
                  </div>
                  <div className={styles.scoreCommentary}>
                    <p>{currentScoreInfo.commentary}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.capitalStructureSection}>
          <h3>Capital Structure</h3>
          <div className={styles.chartRow}>
            <div className={styles.chartContainer}>
              <h4>Shares Outstanding (2019-2024)</h4>
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
            <h4 className={styles.companyRatingTitle}>
              This company is <span className={styles.resilientRating}>
                {parseFloat(financialHealth.altmanZScore.current) > 3 ? "Resilient" : 
                 parseFloat(financialHealth.altmanZScore.current) > 1.8 ? "Stable" : "At Risk"}
              </span>
            </h4>
            <p className={styles.companyRatingDesc}>
              {parseFloat(financialHealth.altmanZScore.current) > 3 
                ? "It is effectively managing its capital to foster growth and it rewards its investors." 
                : parseFloat(financialHealth.altmanZScore.current) > 1.8 
                  ? "It maintains adequate financial stability but may benefit from improved capital management."
                  : "It shows signs of financial stress and may require significant restructuring."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialHealth;
