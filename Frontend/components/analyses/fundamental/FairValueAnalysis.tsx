import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { FaCheckSquare, FaRegSquare, FaInfoCircle } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';
import axios from 'axios';

interface FairValueAnalysisProps {
  symbol: string;
}

interface QuoteData {
  regularMarketPrice: number;
  shortName: string;
  longName: string;
  trailingPE?: number;
  forwardPE?: number;
  epsTrailingTwelveMonths?: number;
  epsForward?: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap?: number;
  dividendYield?: number;
}

interface FinancialData {
  returnOnEquity?: number;
  returnOnAssets?: number;
  totalCashPerShare?: number;
  revenueGrowth?: number;
  earningsGrowth?: number;
  operatingMargins?: number;
  profitMargins?: number;
  totalCash?: number;
  totalDebt?: number;
  freeCashflow?: number;
  operatingCashflow?: number;
  targetMeanPrice?: number;
}

interface EarningsData {
  earningsEstimate?: { avg?: number; growth?: number; };
  revenueEstimate?: { avg?: number; growth?: number; };
  financialsChart?: { 
    yearly?: Array<{date: string; revenue: number; earnings: number;}>;
    quarterly?: Array<{date: string; revenue: number; earnings: number;}>;
  };
  financialCurrency?: string;
}

interface HistoricalDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

const FairValueAnalysis = ({ symbol }: FairValueAnalysisProps) => {
  const [financialData, setFinancialData] = useState({
    lastClose: '0.00',
    fairValue: '0.00'
  });
  const [valuationMethods, setValuationMethods] = useState({
    discountedCashFlow: true,
    peterLynch: true,
    economicValueAdded: true
  });
  
  const [fairValues, setFairValues] = useState({
    discountedCashFlow: '0.00',
    peterLynch: '0.00',
    economicValueAdded: '0.00'
  });
  
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [companyFinancials, setCompanyFinancials] = useState<FinancialData | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate average fair value
  const calculateAverageFairValue = () => {
    // Only include enabled valuation methods
    const enabledValues = Object.entries(fairValues)
      .filter(([key]) => valuationMethods[key as keyof typeof valuationMethods])
      .map(([_, val]) => parseFloat(val));
    
    if (enabledValues.length === 0) return '0.00';
    
    const sum = enabledValues.reduce((acc, val) => acc + val, 0);
    return (sum / enabledValues.length).toFixed(2);
  };

  const toggleValuationMethod = (method: keyof typeof valuationMethods) => {
    setValuationMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  // Calculate discounted cash flow fair value
  const calculateDCF = (
    currentPrice: number,
    freeCashFlow: number,
    growthRate: number,
    discountRate: number = 0.10
  ): string => {
    // If we don't have the necessary data
    if (!freeCashFlow || freeCashFlow <= 0) {
      // Fall back to analyst price target if available
      if (companyFinancials?.targetMeanPrice && companyFinancials.targetMeanPrice > 0) {
        return companyFinancials.targetMeanPrice.toFixed(2);
      }
      return currentPrice.toFixed(2);
    }

    try {
      // Simple DCF over 5 years with terminal value
      const periods = 5;
      let presentValue = 0;
      
      for (let i = 1; i <= periods; i++) {
        const cashFlowForYear = freeCashFlow * Math.pow(1 + growthRate, i);
        const discountFactor = Math.pow(1 + discountRate, i);
        presentValue += cashFlowForYear / discountFactor;
      }
      
      // Terminal value calculation (Gordon Growth Model)
      const terminalGrowthRate = 0.02; // Long-term growth rate of 2%
      const terminalValue = (freeCashFlow * Math.pow(1 + growthRate, periods + 1)) / 
                           (discountRate - terminalGrowthRate);
      const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, periods);
      
      // Total enterprise value
      const enterpriseValue = presentValue + discountedTerminalValue;
      
      // Adjust for debt and cash
      const totalCash = companyFinancials?.totalCash || 0;
      const totalDebt = companyFinancials?.totalDebt || 0;
      const equityValue = enterpriseValue + totalCash - totalDebt;
      
      // Estimate shares outstanding
      let sharesOutstanding = 1;
      if (quoteData?.marketCap && quoteData.regularMarketPrice > 0) {
        sharesOutstanding = quoteData.marketCap / quoteData.regularMarketPrice;
      }
      
      // Fair value per share
      let fairValuePerShare = equityValue / sharesOutstanding;
      
      // Sanity check - cap at 3x current price to avoid extreme valuations
      fairValuePerShare = Math.min(fairValuePerShare, currentPrice * 3);
      
      return fairValuePerShare > 0 ? fairValuePerShare.toFixed(2) : currentPrice.toFixed(2);
    } catch (error) {
      console.error('DCF calculation error:', error);
      return currentPrice.toFixed(2);
    }
  };

  // Calculate Peter Lynch fair value
  const calculatePeterLynch = (
    eps: number, 
    growthRate: number,
    dividendYield: number = 0
  ): string => {
    try {
      if (!eps || eps <= 0) {
        return quoteData?.regularMarketPrice?.toFixed(2) || '0.00';
      }
      
      // Adjust growth rate to percentage (0-100 instead of 0-1)
      const adjustedGrowthRate = growthRate * 100;
      
      // Cap the growth rate at 25% as Lynch suggested
      const cappedGrowthRate = Math.min(Math.max(adjustedGrowthRate, 0), 25);
      
      // Calculate fair P/E using Lynch's formula: Fair P/E = Growth Rate + Dividend Yield
      const fairPE = Math.max(cappedGrowthRate + (dividendYield || 0), 8); // Minimum PE of 8
      
      // Calculate fair value
      const fairValue = eps * fairPE;
      
      // Sanity check - limit to reasonable values
      if (fairValue <= 0 || !isFinite(fairValue)) {
        return quoteData?.regularMarketPrice?.toFixed(2) || '0.00';
      }
      
      // Cap at 3x current price to avoid extreme valuations
      const currentPrice = quoteData?.regularMarketPrice || 0;
      const cappedFairValue = Math.min(fairValue, currentPrice * 3);
      
      return cappedFairValue.toFixed(2);
    } catch (error) {
      console.error('Peter Lynch calculation error:', error);
      return quoteData?.regularMarketPrice?.toFixed(2) || '0.00';
    }
  };

  // Calculate Economic Value Added fair value
  const calculateEVA = (
    currentPrice: number,
    returnOnEquity: number,
    bookValue: number
  ): string => {
    try {
      // If we don't have the necessary data
      if (!returnOnEquity || returnOnEquity <= 0 || !bookValue || bookValue <= 0) {
        // Use a simpler approximation based on P/E
        if (quoteData?.trailingPE && quoteData?.epsTrailingTwelveMonths) {
          const industryAvgPE = 18; // Approximate market average P/E
          const fairPE = Math.min(Math.max(quoteData.trailingPE, industryAvgPE), quoteData.trailingPE * 1.5);
          return (fairPE * quoteData.epsTrailingTwelveMonths).toFixed(2);
        }
        return currentPrice.toFixed(2);
      }
      
      // Cost of equity (simplified)
      const costOfEquity = 0.08; // 8% as approximate cost of equity
      
      // Calculate EVA per share
      const economicValueAddedPerShare = bookValue * (returnOnEquity - costOfEquity);
      
      // Calculate present value of future EVA (simplified perpetuity)
      const growthRate = 0.02; // 2% long-term growth
      const presentValueOfEVA = economicValueAddedPerShare / (costOfEquity - growthRate);
      
      // Fair value = Book value + Present value of future EVA
      let fairValue = bookValue + presentValueOfEVA;
      
      // Sanity check - cap at 3x current price to avoid extreme valuations
      fairValue = Math.min(fairValue, currentPrice * 3);
      fairValue = Math.max(fairValue, bookValue); // Fair value should be at least book value
      
      return fairValue > 0 ? fairValue.toFixed(2) : currentPrice.toFixed(2);
    } catch (error) {
      console.error('EVA calculation error:', error);
      return currentPrice.toFixed(2);
    }
  };

  // Prepare chart data from historical data
  const prepareFairValueChartData = () => {
    if (!historicalData || historicalData.length === 0 || !quoteData) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Price',
            data: [],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: 'Fair Value',
            data: [],
            borderColor: 'rgb(255, 159, 64)',
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
          }
        ]
      };
    }

    // Sort data chronologically
    const sortedData = [...historicalData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Use quarterly data points for chart clarity
    const quarterlyData = sortedData.filter((_, index) => index % 63 === 0);
    
    // For fair value, we'll create a simplified model based on earnings growth
    // This is a simple approximation - real fair value models would be more complex
    const labels = quarterlyData.map(d => {
      const date = new Date(d.date);
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    });

    const prices = quarterlyData.map(d => d.adjClose);
    
    // Generate historic fair values based on a simplified growth model
    // In reality, you would use historical financials for more accurate results
    const fairValues = [];
    const currentFairValue = parseFloat(calculateAverageFairValue());
    const currentPrice = quoteData.regularMarketPrice;
    
    // Calculate an implied growth rate from current price to fair value
    const implied5YearGrowthRate = Math.pow(currentFairValue / currentPrice, 1/5) - 1;
    
    for (let i = 0; i < quarterlyData.length; i++) {
      // Apply the implied growth rate in reverse to generate historical fair values
      const periodsFromNow = quarterlyData.length - i - 1;
      const historicFairValue = currentFairValue / Math.pow(1 + implied5YearGrowthRate, periodsFromNow);
      fairValues.push(historicFairValue);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Price',
          data: prices,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.1,
          fill: false
        },
        {
          label: 'Fair Value',
          data: fairValues,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          tension: 0.1,
          fill: false
        }
      ]
    };
  };

  // Fetch financial data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch quote data
        const quoteResponse = await axios.get(`http://localhost:3001/api/finance/quote?symbol=${symbol}`);
        const quoteResult = Array.isArray(quoteResponse.data) ? quoteResponse.data[0] : quoteResponse.data;
        setQuoteData(quoteResult);
        console.log('Quote data:', quoteResult);

        // Fetch historical data (2 years)
        const today = new Date();
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(today.getFullYear() - 2);
        
        const historicalResponse = await axios.get(
          `http://localhost:3001/api/finance/historical?symbol=${symbol}&from=${twoYearsAgo.toISOString()}&to=${today.toISOString()}&interval=1d`
        );
        setHistoricalData(historicalResponse.data);
        console.log('Historical data sample:', historicalResponse.data?.slice(0, 2));

        // Fetch detailed company financials
        const summaryResponse = await axios.get(
          `http://localhost:3001/api/finance/quoteSummary?symbol=${symbol}&modules=financialData,earnings,defaultKeyStatistics,summaryDetail`
        );
        
        console.log('Quote summary data:', summaryResponse.data);
        
        const financialsData = summaryResponse.data.financialData || {};
        setCompanyFinancials(financialsData);
        
        const earnings = summaryResponse.data.earnings || {};
        setEarningsData(earnings);
        
        const keyStats = summaryResponse.data.defaultKeyStatistics || {};
        const summaryDetail = summaryResponse.data.summaryDetail || {};

        // Extract current price
        const currentPrice = quoteResult.regularMarketPrice;
        setFinancialData(prev => ({
          ...prev,
          lastClose: currentPrice.toFixed(2)
        }));
        
        // Calculate fair values using different methods
        
        // 1. DCF Calculation
        let growthRate = financialsData.earningsGrowth || 0.05;
        if (!isFinite(growthRate) || growthRate <= 0) {
          // Fallback to revenue growth if earnings growth is not available
          growthRate = financialsData.revenueGrowth || 0.05;
        }
        growthRate = Math.max(0.02, Math.min(growthRate, 0.30)); // Cap between 2% and 30%
        
        // Get free cash flow per share
        let freeCashFlow = financialsData.freeCashflow || financialsData.operatingCashflow || 0;
        
        // Ensure valid freeCashFlow
        if (!isFinite(freeCashFlow) || freeCashFlow <= 0) {
          freeCashFlow = (financialsData.operatingCashflow || 0) - (financialsData.capitalExpenditures || 0);
        }
        
        const dcfValue = calculateDCF(currentPrice, freeCashFlow, growthRate);
        console.log('DCF inputs:', { freeCashFlow, growthRate, currentPrice });
        console.log('DCF value:', dcfValue);
        
        // 2. Peter Lynch Calculation
        const epsValue = quoteResult.epsTrailingTwelveMonths || quoteResult.epsForward || 0;
        const dividendYield = summaryDetail.dividendYield || quoteResult.dividendYield || 0;
        
        const lynchValue = calculatePeterLynch(
          epsValue, 
          growthRate,
          dividendYield
        );
        console.log('Lynch inputs:', { epsValue, growthRate, dividendYield });
        console.log('Lynch value:', lynchValue);
        
        // 3. EVA Calculation
        let roe = financialsData.returnOnEquity || 0; 
        if (!isFinite(roe) || roe <= 0) {
          // Default to industry average if not available
          roe = 0.10;
        }
        
        // Get book value per share
        const bookValue = keyStats.bookValue || 0;
        
        const evaValue = calculateEVA(
          currentPrice,
          roe,
          bookValue
        );
        console.log('EVA inputs:', { roe, bookValue, currentPrice });
        console.log('EVA value:', evaValue);
        
        // Update fair values
        setFairValues({
          discountedCashFlow: dcfValue,
          peterLynch: lynchValue,
          economicValueAdded: evaValue
        });
        
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  // Update fair value when valuation methods change
  useEffect(() => {
    const avgFairValue = calculateAverageFairValue();
    setFinancialData(prev => ({
      ...prev,
      fairValue: avgFairValue
    }));
  }, [fairValues, valuationMethods]);

  // Prepare chart data
  const fairValueData = prepareFairValueChartData();

  return (
    <div className={styles.chartContainer}>
      <h3>Price & Fair Value Analysis</h3>
      
      {isLoading ? (
        <div className={styles.loadingState}>Loading fair value analysis...</div>
      ) : (
        <>
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
              <button 
                className={styles.methodButton} 
                onClick={() => toggleValuationMethod('discountedCashFlow')}
                title="Discounted Cash Flow valuation model"
              >
                {valuationMethods.discountedCashFlow ? <FaCheckSquare /> : <FaRegSquare />} DCF
              </button>
              <button 
                className={styles.methodButton} 
                onClick={() => toggleValuationMethod('peterLynch')}
                title="Peter Lynch's valuation model"
              >
                {valuationMethods.peterLynch ? <FaCheckSquare /> : <FaRegSquare />} Lynch
              </button>
              <button 
                className={styles.methodButton} 
                onClick={() => toggleValuationMethod('economicValueAdded')}
                title="Economic Value Added valuation model"
              >
                {valuationMethods.economicValueAdded ? <FaCheckSquare /> : <FaRegSquare />} EVA
              </button>
            </div>
          </div>
          
          <div className={styles.fairValueBoxesContainer}>
            <div className={`${styles.fairValueBox} ${!valuationMethods.discountedCashFlow ? styles.disabledMethod : ''}`}>
              <h4>DCF</h4>
              <div className={styles.fairValueAmount}>${fairValues.discountedCashFlow}</div>
            </div>
            <div className={`${styles.fairValueBox} ${!valuationMethods.peterLynch ? styles.disabledMethod : ''}`}>
              <h4>Lynch</h4>
              <div className={styles.fairValueAmount}>${fairValues.peterLynch}</div>
            </div>
            <div className={`${styles.fairValueBox} ${!valuationMethods.economicValueAdded ? styles.disabledMethod : ''}`}>
              <h4>EVA</h4>
              <div className={styles.fairValueAmount}>${fairValues.economicValueAdded}</div>
            </div>
          </div>
          
          <div className={styles.averageFairValueContainer}>
            <div className={styles.averageFairValueHeader}>
              <h4>Average Fair Value <FaInfoCircle className={styles.infoIcon} title="Average of selected valuation methods" /></h4>
            </div>
            
            <div className={styles.averageFairValueContent}>
              <div className={styles.averageValueBox}>
                <div className={styles.averageFairValueAmount}>
                  ${calculateAverageFairValue()}
                </div>
                <div className={styles.currentPriceComparison}>
                  {parseFloat(calculateAverageFairValue()) > parseFloat(financialData.lastClose) ? 
                    <span className={styles.undervalued}>
                      Undervalued by {((parseFloat(calculateAverageFairValue()) / parseFloat(financialData.lastClose) - 1) * 100).toFixed(1)}%
                    </span> :
                    <span className={styles.overvalued}>
                      Overvalued by {((parseFloat(financialData.lastClose) / parseFloat(calculateAverageFairValue()) - 1) * 100).toFixed(1)}%
                    </span>
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
        </>
      )}
    </div>
  );
};

export default FairValueAnalysis;
