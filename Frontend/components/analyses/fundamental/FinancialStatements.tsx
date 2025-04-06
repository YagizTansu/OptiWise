import { useState, useEffect } from 'react';
import styles from '../../../styles/fundamental/FinancialStatements.module.css';
import { FaChartLine, FaBalanceScale, FaMoneyBillWave, FaRegCalendarAlt, FaRegCalendar, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { fetchFundamentalsTimeSeries } from '../../../services/api/finance';

// Financial statement data types
interface FinancialStatementData {
  incomeStatement: Record<string, Record<string, number | string>>;
  balanceSheet: Record<string, Record<string, number | string>>;
  cashFlowStatement: Record<string, Record<string, number | string>>;
  years: string[];
}

// Financial statement descriptions
const statementDescriptions = {
  incomeStatement: "Shows the company's revenues and expenses over a specific period, revealing if the company is profitable.",
  balanceSheet: "Provides a snapshot of what the company owns (assets), what it owes (liabilities), and shareholder equity at a specific point in time.",
  cashFlowStatement: "Tracks how cash moved in and out of the business over a period, showing operational efficiency, investment activities, and financing decisions."
};

// Format large numbers as k, M, B with commas for thousands
const formatValue = (value: number | string): string => {
  if (value === '-' || value === undefined) return '-';
  
  if (typeof value === 'number') {
    // For EPS values which are typically small
    if (Math.abs(value) < 10) {
      return value.toFixed(2);
    }
    
    // Format thousands for readability
    const absValue = Math.abs(value);
    if (absValue >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    } else if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (absValue >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toString();
  }
  
  return value.toString();
};

// Calculate year-over-year change percentage
const calculateYoYChange = (current: number | string, previous: number | string): string => {
  if (
    current === '-' || 
    previous === '-' || 
    typeof current !== 'number' || 
    typeof previous !== 'number' ||
    previous === 0
  ) {
    return '-';
  }
  
  const changePercent = ((current - previous) / Math.abs(previous)) * 100;
  return `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
};

// Define empty initial data structure
const emptyFinancialData: FinancialStatementData = {
  years: [],
  incomeStatement: {},
  balanceSheet: {},
  cashFlowStatement: {}
};

interface FinancialStatementsProps {
  symbol?: string;
}

const FinancialStatements: React.FC<FinancialStatementsProps> = ({ symbol = 'AAPL' }) => {
  const [activeTab, setActiveTab] = useState<'income' | 'balance' | 'cash'>('income');
  const [periodType, setPeriodType] = useState<'annual' | 'quarterly'>('annual');
  const [showYoY, setShowYoY] = useState<boolean>(true);
  const [data, setData] = useState<FinancialStatementData>(emptyFinancialData);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{top: number, left: number}>({top: 0, left: 0});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchFinancialData = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        // Fetch financial data using the API
        const financialData = await fetchFundamentalsTimeSeries(
          symbol,
          '2000-01-01',
          'all',
          periodType
        );
        
        if (!financialData || financialData.length === 0) {
          setHasError(true);
          setIsLoading(false);
          return;
        }
        
        // Process and transform the data
        const processedData = processFinancialData(financialData);
        setData(processedData);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFinancialData();
  }, [symbol, periodType]);
  
  // Process raw financial data into the format needed for display
  const processFinancialData = (rawData: any[]): FinancialStatementData => {
    // Extract years (dates) from the data
    const years = rawData.map(item => item.date).sort();
    
    // Initialize data structure
    const processedData: FinancialStatementData = {
      years,
      incomeStatement: {},
      balanceSheet: {},
      cashFlowStatement: {}
    };
    
    // Define mapping for each statement section
    const fieldMappings = {
      incomeStatement: {
        'Total Revenue': 'totalRevenue',
        'Cost of Revenue': 'costOfRevenue',
        'Gross Profit': 'grossProfit',
        'Operating Expenses': 'operatingExpense',
        '- R&D': 'researchAndDevelopment',
        '- SG&A': 'sellingGeneralAndAdministration',
        'Operating Income': 'operatingIncome',
        'Interest Expense': 'interestExpense',
        'Pretax Income': 'pretaxIncome',
        'Tax Provision': 'taxProvision',
        'Net Income': 'netIncome',
        'Basic EPS (USD)': 'basicEPS',
        'Diluted EPS (USD)': 'dilutedEPS',
        'EBITDA': 'EBITDA'
      },
      balanceSheet: {
        'Cash & Equivalents': 'cashAndCashEquivalents',
        'Short-Term Investments': 'otherShortTermInvestments',
        'Accounts Receivable': 'accountsReceivable',
        'Inventory': 'inventory',
        'Total Current Assets': 'currentAssets',
        'Net PPE': 'netPPE',
        'Goodwill & Intangibles': 'goodwillAndOtherIntangibleAssets',
        'Total Non-Current Assets': 'totalNonCurrentAssets',
        'Total Assets': 'totalAssets',
        'Current Debt': 'currentDebt',
        'Accounts Payable': 'accountsPayable',
        'Total Current Liabilities': 'currentLiabilities',
        'Long-Term Debt': 'longTermDebt',
        'Total Liabilities': 'totalLiabilitiesNetMinorityInterest',
        'Total Equity': 'stockholdersEquity'
      },
      cashFlowStatement: {
        'Operating Cash Flow': 'operatingCashFlow',
        'Investing Cash Flow': 'investingCashFlow',
        '- Capex': 'capitalExpenditure',
        '- Investments': 'purchaseOfInvestment',
        'Financing Cash Flow': 'financingCashFlow',
        '- Debt Issuance': 'issuanceOfDebt',
        '- Share Buybacks': 'repurchaseOfCapitalStock',
        'Net Change in Cash': 'changesInCash',
        'Free Cash Flow': 'freeCashFlow'
      }
    };
    
    // Initialize structure for each line item
    for (const statement in fieldMappings) {
      const mappings = fieldMappings[statement as keyof typeof fieldMappings];
      
      for (const [displayName, fieldName] of Object.entries(mappings)) {
        processedData[statement as keyof FinancialStatementData][displayName] = {};
        
        // Initialize with '-' for each year
        years.forEach(year => {
          processedData[statement as keyof FinancialStatementData][displayName][year] = '-';
        });
      }
    }
    
    // Fill in the data from the API response
    rawData.forEach(yearData => {
      const year = yearData.date;
      
      // Process each statement type
      for (const statement in fieldMappings) {
        const mappings = fieldMappings[statement as keyof typeof fieldMappings];
        
        for (const [displayName, fieldName] of Object.entries(mappings)) {
          if (yearData[fieldName] !== undefined) {
            processedData[statement as keyof FinancialStatementData][displayName][year] = yearData[fieldName];
          }
        }
      }
    });
    
    return processedData;
  };
  
  // Get the current dataset based on the active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'income':
        return data.incomeStatement;
      case 'balance':
        return data.balanceSheet;
      case 'cash':
        return data.cashFlowStatement;
      default:
        return data.incomeStatement;
    }
  };
  
  // Get the years to display (filtering out years with no data if needed)
  const getVisibleYears = () => {
    if (data.years.length === 0) return [];
    return data.years; // Show all years
  };

  // Format year or quarter for display in the table header
  const formatPeriodHeader = (dateString: string): string => {
    if (periodType === 'quarterly') {
      const date = new Date(dateString);
      const year = date.getFullYear();
      // Get quarter from month (0-2: Q1, 3-5: Q2, 6-8: Q3, 9-11: Q4)
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year} Q${quarter}`;
    }
    // For annual data, just show the year
    return dateString.substring(0, 4);
  };
  
  // Handle tooltip display
  const handleInfoIconHover = (
    event: React.MouseEvent, 
    content: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipContent(content);
    setTooltipPosition({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX - 150
    });
  };
  
  const handleInfoIconLeave = () => {
    setTooltipContent(null);
  };
  
  // Get statement title and icon
  const getStatementTitle = (): { title: string, icon: JSX.Element } => {
    switch (activeTab) {
      case 'income':
        return { 
          title: 'Income Statement', 
          icon: <FaChartLine className={styles.cardTitleIcon} /> 
        };
      case 'balance':
        return { 
          title: 'Balance Sheet', 
          icon: <FaBalanceScale className={styles.cardTitleIcon} /> 
        };
      case 'cash':
        return { 
          title: 'Cash Flow Statement', 
          icon: <FaMoneyBillWave className={styles.cardTitleIcon} /> 
        };
      default:
        return { 
          title: 'Income Statement', 
          icon: <FaChartLine className={styles.cardTitleIcon} /> 
        };
    }
  };

  if (isLoading) {
    return (
      <div className={styles.modernLoadingContainer}>
        <div className={styles.loadingSpinnerLarge}></div>
        <h3>Loading Financial Statements</h3>
        <p>Retrieving financial data for {symbol}...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={styles.modernErrorContainer}>
        <div className={styles.errorIconLarge}><FaExclamationTriangle /></div>
        <h3>Unable to Load Data</h3>
        <p>There was an error loading the financial data. Please try again later.</p>
        <button 
          className={styles.modernRetryButton}
          onClick={() => {
            setIsLoading(true);
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const visibleYears = getVisibleYears();
  const isDataEmpty = visibleYears.length === 0;

  if (isDataEmpty) {
    return (
      <div className={styles.container}>
        <div className={styles.enhancedNoDataMessage}>
          <FaExclamationTriangle className={styles.noDataIcon} />
          <h4>No Financial Data Available</h4>
          <p>We couldn't find any financial statements for {symbol} at this time. This may be due to the company being newly listed, delayed reporting, or limited data availability.</p>
          <button 
            className={styles.modernRetryButton}
            onClick={() => {
              setIsLoading(true);
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { title, icon } = getStatementTitle();
  const currentData = getCurrentData();
  
  return (
    <div className={styles.financialStatementCard}>
      <div className={styles.modernCardHeader}>
        <h3>
          {title}
          <span 
            className={styles.infoButtonContainer}
            onMouseEnter={(e) => handleInfoIconHover(e, statementDescriptions[activeTab])}
            onMouseLeave={handleInfoIconLeave}
          >
          </span>
        </h3>
        
        <div className={styles.controlsRow}>
          <div className={styles.statementTypeControls}>
            <button 
              className={`${styles.statementTypeButton} ${activeTab === 'income' ? styles.activeStatementType : ''}`}
              onClick={() => setActiveTab('income')}
            >
              <FaChartLine style={{ marginRight: '6px' }} />
              Income
            </button>
            <button 
              className={`${styles.statementTypeButton} ${activeTab === 'balance' ? styles.activeStatementType : ''}`}
              onClick={() => setActiveTab('balance')}
            >
              <FaBalanceScale style={{ marginRight: '6px' }} />
              Balance Sheet
            </button>
            <button 
              className={`${styles.statementTypeButton} ${activeTab === 'cash' ? styles.activeStatementType : ''}`}
              onClick={() => setActiveTab('cash')}
            >
              <FaMoneyBillWave style={{ marginRight: '6px' }} />
              Cash Flow
            </button>
          </div>
          
          <div className={styles.periodTypeControls}>
            <button 
              className={`${styles.periodButton} ${periodType === 'annual' ? styles.activePeriod : ''}`}
              onClick={() => setPeriodType('annual')}
            >
              <FaRegCalendar style={{ marginRight: '6px' }} />
              Annual
            </button>
            <button 
              className={`${styles.periodButton} ${periodType === 'quarterly' ? styles.activePeriod : ''}`}
              onClick={() => setPeriodType('quarterly')}
            >
              <FaRegCalendarAlt style={{ marginRight: '6px' }} />
              Quarterly
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <div className={styles.financialTableContainer}>
          <table className={styles.financialTable}>
            <thead>
              <tr>
                <th>Line Item</th>
                {visibleYears.map((year, index) => (
                  <th key={year} className={styles.numericCell}>
                    {formatPeriodHeader(year)}
                  </th>
                ))}
                {showYoY && visibleYears.length > 1 && (
                  <th className={styles.numericCell}>
                    {periodType === 'quarterly' ? 'QoQ Change' : 'YoY Change'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {Object.entries(currentData).map(([lineItem, yearData]) => (
                <tr 
                  key={lineItem} 
                  className={
                    lineItem === 'Net Income' || lineItem === 'Total Assets' || 
                    lineItem === 'Free Cash Flow' ? styles.highlightRow : ''
                  }
                >
                  <td className={lineItem.startsWith('-') ? styles.subItem : ''}>
                    {lineItem}
                  </td>
                  {visibleYears.map(year => (
                    <td 
                      key={year} 
                      className={`${styles.numericCell}`}
                    >
                      {formatValue(yearData[year])}
                    </td>
                  ))}
                  {showYoY && visibleYears.length > 1 && (
                    <td className={`${styles.numericCell} ${
                      calculateYoYChange(
                        yearData[visibleYears[visibleYears.length - 1]], 
                        yearData[visibleYears[visibleYears.length - 2]]
                      ).startsWith('+') ? 
                        styles.positive : 
                        calculateYoYChange(
                          yearData[visibleYears[visibleYears.length - 1]], 
                          yearData[visibleYears[visibleYears.length - 2]]
                        ).startsWith('-') ? 
                          styles.negative : ''
                    }`}>
                      {calculateYoYChange(
                        yearData[visibleYears[visibleYears.length - 1]], 
                        yearData[visibleYears[visibleYears.length - 2]]
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Tooltip for info hover */}
      {tooltipContent && (
        <div 
          className={styles.enhancedInfoTooltip} 
          style={{ 
            top: tooltipPosition.top, 
            left: tooltipPosition.left 
          }}
        >
          {tooltipContent}
        </div>
      )}
      
      <div className={styles.statementFooter}>
        <p className={styles.statementDisclaimer}>
          All figures in thousands of USD unless otherwise stated. EPS values are in USD per share.
          {periodType === 'quarterly' && ' Quarterly data may be subject to seasonality.'}
        </p>
      </div>
    </div>
  );
};

export default FinancialStatements;
