import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';

interface FinancialStatementsProps {
  symbol: string;
}

interface FinancialData {
  incomeStatementHistory?: any;
  incomeStatementHistoryQuarterly?: any;
  balanceSheetHistory?: any;
  balanceSheetHistoryQuarterly?: any;
  cashflowStatementHistory?: any;
  cashflowStatementHistoryQuarterly?: any;
}

type StatementType = 'income' | 'balance' | 'cashflow';
type PeriodType = 'annual' | 'quarterly';

const FinancialStatements = ({ symbol }: FinancialStatementsProps) => {
  const [data, setData] = useState<FinancialData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatement, setActiveStatement] = useState<StatementType>('income');
  const [activePeriod, setActivePeriod] = useState<PeriodType>('annual');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const modules = [
          'incomeStatementHistory', 
          'incomeStatementHistoryQuarterly', 
          'balanceSheetHistory', 
          'balanceSheetHistoryQuarterly',
          'cashflowStatementHistory', 
          'cashflowStatementHistoryQuarterly'
        ];
        
        const response = await axios.get(`http://localhost:3001/api/finance/quoteSummary?symbol=${symbol}&modules=${modules.join(',')}`);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch financial data');
        setLoading(false);
        console.error(err);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  // Determine which data to display based on active statement and period
  const getStatementData = () => {
    if (activeStatement === 'income') {
      return activePeriod === 'annual' 
        ? data.incomeStatementHistory?.incomeStatementHistory || [] 
        : data.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
    } else if (activeStatement === 'balance') {
      return activePeriod === 'annual' 
        ? data.balanceSheetHistory?.balanceSheetStatements || [] 
        : data.balanceSheetHistoryQuarterly?.balanceSheetStatements || [];
    } else {
      return activePeriod === 'annual' 
        ? data.cashflowStatementHistory?.cashflowStatements || [] 
        : data.cashflowStatementHistoryQuarterly?.cashflowStatements || [];
    }
  };

  // Format large numbers for better readability
  const formatValue = (value: number) => {
    if (value === undefined || value === null) return 'N/A';
    
    if (value >= 1.0e9) return `$${(value / 1.0e9).toFixed(2)}B`;
    if (value >= 1.0e6) return `$${(value / 1.0e6).toFixed(2)}M`;
    if (value >= 1.0e3) return `$${(value / 1.0e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  const statementData = getStatementData();
  
  // Generate a list of key metrics to display based on the active statement
  const getDisplayMetrics = () => {
    if (activeStatement === 'income') {
      return [
        { key: 'totalRevenue', label: 'Total Revenue' },
        { key: 'costOfRevenue', label: 'Cost of Revenue' },
        { key: 'grossProfit', label: 'Gross Profit' },
        { key: 'researchDevelopment', label: 'R&D' },
        { key: 'sellingGeneralAdministrative', label: 'SG&A' },
        { key: 'operatingIncome', label: 'Operating Income' },
        { key: 'netIncome', label: 'Net Income' },
        { key: 'ebit', label: 'EBIT' }
      ];
    } else if (activeStatement === 'balance') {
      return [
        { key: 'totalAssets', label: 'Total Assets' },
        { key: 'cash', label: 'Cash & Equivalents' },
        { key: 'totalCurrentAssets', label: 'Current Assets' },
        { key: 'propertyPlantEquipment', label: 'PP&E' },
        { key: 'goodWill', label: 'Goodwill' },
        { key: 'totalLiab', label: 'Total Liabilities' },
        { key: 'totalCurrentLiabilities', label: 'Current Liabilities' },
        { key: 'longTermDebt', label: 'Long Term Debt' },
        { key: 'totalStockholderEquity', label: 'Shareholders Equity' }
      ];
    } else {
      return [
        { key: 'totalCashFromOperatingActivities', label: 'Cash from Operations' },
        { key: 'capitalExpenditures', label: 'Capital Expenditures' },
        { key: 'investments', label: 'Investments' },
        { key: 'totalCashflowsFromInvestingActivities', label: 'Cash from Investing' },
        { key: 'dividendsPaid', label: 'Dividends Paid' },
        { key: 'netBorrowings', label: 'Net Borrowings' },
        { key: 'totalCashFromFinancingActivities', label: 'Cash from Financing' },
        { key: 'changeInCash', label: 'Change in Cash' }
      ];
    }
  };

  const metrics = getDisplayMetrics();

  const getStatementTitle = () => {
    switch(activeStatement) {
      case 'income': return 'Income Statement';
      case 'balance': return 'Balance Sheet';
      case 'cashflow': return 'Cash Flow Statement';
    }
  };

  return (
    <div className={styles.financialStatementCard}>
      <div className={styles.cardHeader}>
        <h3>{getStatementTitle()}</h3>
        <div className={styles.statementDescription}>
          {activeStatement === 'income' && (
            <p>Shows revenue, expenses, and profitability over a period of time</p>
          )}
          {activeStatement === 'balance' && (
            <p>Provides a snapshot of assets, liabilities, and shareholders' equity</p>
          )}
          {activeStatement === 'cashflow' && (
            <p>Tracks the flow of cash in and out of the business</p>
          )}
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.statementControls}>
          <div className={styles.controlsRow}>
            <div className={styles.statementTypeControls}>
              <button 
                className={`${styles.statementTypeButton} ${activeStatement === 'income' ? styles.activeStatementType : ''}`} 
                onClick={() => setActiveStatement('income')}
              >
                Income Statement
              </button>
              <button 
                className={`${styles.statementTypeButton} ${activeStatement === 'balance' ? styles.activeStatementType : ''}`} 
                onClick={() => setActiveStatement('balance')}
              >
                Balance Sheet
              </button>
              <button 
                className={`${styles.statementTypeButton} ${activeStatement === 'cashflow' ? styles.activeStatementType : ''}`} 
                onClick={() => setActiveStatement('cashflow')}
              >
                Cash Flow
              </button>
            </div>
            <div className={styles.periodTypeControls}>
              <button 
                className={`${styles.periodButton} ${activePeriod === 'annual' ? styles.activePeriod : ''}`} 
                onClick={() => setActivePeriod('annual')}
              >
                Annual
              </button>
              <button 
                className={`${styles.periodButton} ${activePeriod === 'quarterly' ? styles.activePeriod : ''}`} 
                onClick={() => setActivePeriod('quarterly')}
              >
                Quarterly
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.statementLoading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading financial data...</p>
          </div>
        ) : error ? (
          <div className={styles.statementError}>
            <p>{error}</p>
            <button 
              className={styles.retryButton} 
              onClick={() => {
                setError(null);
                setLoading(true);
                // Re-fetch data
              }}
            >
              Retry
            </button>
          </div>
        ) : statementData.length > 0 ? (
          <div className={styles.financialTableContainer}>
            <table className={styles.financialTable}>
              <thead>
                <tr>
                  <th className={styles.itemColumn}>Item</th>
                  {statementData.map((statement: any, index: number) => (
                    <th key={index} className={styles.periodColumn}>
                      {formatDate(statement.endDate)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.key} className={styles.dataRow}>
                    <td className={styles.metricLabel}>{metric.label}</td>
                    {statementData.map((statement: any, index: number) => (
                      <td 
                        key={index} 
                        className={`${styles.metricValue} ${
                          statement[metric.key] < 0 ? styles.negative : ''
                        }`}
                      >
                        {formatValue(statement[metric.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.noStatementData}>
            <p>No financial data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialStatements;
