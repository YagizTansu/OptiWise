import React, { useState, useEffect } from 'react';
import { fetchFundamentalsTimeSeries, fetchStockDashboardData } from '../../../services/api/finance';
import styles from '../../../styles/fundamental/ValuationModels.module.css';
import { useTheme } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { FaExclamationTriangle } from 'react-icons/fa';

interface ValuationModelsProps {
  symbol: string;
}

const ValuationModels: React.FC<ValuationModelsProps> = ({ symbol }) => {
  const theme = useTheme();
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [periodType, setPeriodType] = useState<string>('annual');
  const [currentTab, setCurrentTab] = useState<number>(0);

  // Calculated values
  const [dcfValue, setDcfValue] = useState<number | null>(null);
  const [dcfUpside, setDcfUpside] = useState<number | null>(null);
  const [lynchValue, setLynchValue] = useState<number | null>(null);
  const [lynchUpside, setLynchUpside] = useState<number | null>(null);
  const [evaValue, setEvaValue] = useState<number | null>(null);
  const [evaUpside, setEvaUpside] = useState<number | null>(null);
  const [assumptions, setAssumptions] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add debug log to trace data
        console.log("Fetching valuation model data for:", symbol);
        setLoading(true);
        setError(null);

        // Fetch fundamental time series data
        const financialDataResult = await fetchFundamentalsTimeSeries(
          symbol,
          '2000-01-01',
          'all',
          periodType
        );

        // Fetch stock dashboard data
        const dashboardResult = await fetchStockDashboardData(symbol);

        // Handle potential API failures
        if (!financialDataResult || financialDataResult.length === 0) {
          setError('Failed to fetch financial data. This might be due to temporary issues with Yahoo Finance API.');
          setLoading(false);
          return;
        }

        if (!dashboardResult || Object.keys(dashboardResult).length === 0) {
          setError('Failed to fetch stock data. This might be due to temporary issues with Yahoo Finance API.');
          setLoading(false);
          return;
        }

        setFinancialData(financialDataResult);
        setDashboardData(dashboardResult);

        // Calculate valuations
        calculateValuations(financialDataResult, dashboardResult);

        setLoading(false);
      } catch (err: unknown) {
        let errorMessage = 'Failed to fetch data. Please try again later.';
        
        if (err instanceof Error && err.message?.includes('collectConsentSubmitResponse')) {
          errorMessage = 'Yahoo Finance API is experiencing issues. Please try again later.';
        }
          
        setError(errorMessage);
        setLoading(false);
        console.error('Error fetching valuation data:', err);
      }
    };

    fetchData();
  }, [symbol, periodType]);

  // Add debug log when rendering
  useEffect(() => {
    if (!loading) {
      console.log("Valuation model data state:", { 
        financialData, 
        dashboardData, 
        hasFinancialData: financialData?.length > 0,
        hasDashboardData: !!dashboardData
      });
    }
  }, [loading, financialData, dashboardData]);

  const calculateValuations = (financialData: any[], dashboardData: any) => {
    if (!financialData?.length || !dashboardData) return;

    // Get current market price
    const currentPrice = dashboardData?.price?.regularMarketPrice || 0;
    if (!currentPrice) return;

    // Calculate DCF
    calculateDCF(financialData, dashboardData, currentPrice);

    // Calculate Peter Lynch Valuation
    calculatePeterLynch(financialData, dashboardData, currentPrice);

    // Calculate EVA
    calculateEVA(financialData, dashboardData, currentPrice);
  };

  const calculateDCF = (financialData: any[], dashboardData: any, currentPrice: number) => {
    try {
      // Get historical free cash flows (most recent 5 years if available)
      const freeCashFlows = financialData
        .filter(data => data.freeCashFlow !== undefined && data.freeCashFlow !== null)
        .slice(0, 5)
        .map(data => data.freeCashFlow);

      if (freeCashFlows.length < 2) {
        setDcfValue(null);
        setDcfUpside(null);
        return;
      }

      // Calculate average growth rate from historical FCF (corrected calculation)
      let growthRates: number[] = [];
      let validGrowthRateCount = 0;

      for (let i = 0; i < freeCashFlows.length - 1; i++) {
        const current = freeCashFlows[i];
        const previous = freeCashFlows[i + 1];

        // Skip negative or zero previous cash flows to avoid misleading growth rates
        if (previous <= 0) continue;

        const growth = (current - previous) / previous;
        growthRates.push(growth);
        validGrowthRateCount++;
      }

      // Average historical growth rate (cap at reasonable values)
      // Use valid growth rates only, default to minimum if no valid rates
      const avgGrowthRate = validGrowthRateCount > 0
        ? Math.min(
            Math.max(
              growthRates.reduce((sum, rate) => sum + rate, 0) / validGrowthRateCount,
              0.03 // Minimum 3% growth
            ),
            0.15 // Maximum 15% growth
          )
        : 0.03; // Default to minimum if no valid growth rates

      // DCF assumptions
      const discountRate = 0.10; // 10% discount rate (WACC estimate)
      const terminalGrowthRate = 0.03; // 3% terminal growth
      const projectionYears = 5; // 5-year projection
      const sharesOutstanding =
        dashboardData.defaultKeyStatistics?.sharesOutstanding ||
        dashboardData.price?.marketCap / currentPrice;

      // Most recent free cash flow (use absolute value if negative for projection base)
      const mostRecentFCF = freeCashFlows[0];
      const baseFCF = mostRecentFCF < 0 ? Math.abs(mostRecentFCF) * 0.5 : mostRecentFCF;

      // Project future free cash flows with improved method
      let projectedFCF = [];
      for (let year = 1; year <= projectionYears; year++) {
        projectedFCF.push(baseFCF * Math.pow(1 + avgGrowthRate, year));
      }

      // Calculate present value of projected FCFs (DCF formula)
      let presentValueFCF = 0;
      projectedFCF.forEach((fcf, index) => {
        presentValueFCF += fcf / Math.pow(1 + discountRate, index + 1);
      });

      // Calculate terminal value using Gordon Growth Model
      // TV = FCF in final year × (1 + g) / (r - g)
      const terminalValue =
        (projectedFCF[projectionYears - 1] * (1 + terminalGrowthRate)) /
        (discountRate - terminalGrowthRate);

      // Present value of terminal value
      const presentValueTerminal =
        terminalValue / Math.pow(1 + discountRate, projectionYears);

      // Enterprise value = PV of FCF + PV of terminal value
      const enterpriseValue = presentValueFCF + presentValueTerminal;

      // Adjust for cash and debt to get equity value
      const cash = financialData[0]?.cashAndCashEquivalents || 0;
      const debt = financialData[0]?.totalDebt || 0;
      const equityValue = enterpriseValue + cash - debt;

      // Calculate per-share value
      const perShareValue = equityValue / sharesOutstanding;

      // Store results
      setDcfValue(perShareValue);
      setDcfUpside(((perShareValue - currentPrice) / currentPrice) * 100);

      // Store assumptions
      setAssumptions((prev: any) => ({
        ...prev,
        dcf: {
          growthRate: avgGrowthRate,
          discountRate,
          terminalGrowthRate,
          projectionYears,
          baseFreeCashFlow: baseFCF
        }
      }));
    } catch (err: unknown) {
      console.error('DCF calculation error:', err);
      setDcfValue(null);
      setDcfUpside(null);
    }
  };

  const calculatePeterLynch = (financialData: any[], dashboardData: any, currentPrice: number) => {
    try {
      // If no financial data or dashboard data, early return
      if (!financialData?.length || !dashboardData) {
        setLynchValue(null);
        setLynchUpside(null);
        return;
      }
      
      // Get EPS data (most recent 5 years if available)
      const epsData = financialData
        .filter(data => data.dilutedEPS !== undefined && data.dilutedEPS !== null)
        .slice(0, 5)
        .map(data => data.dilutedEPS);

      if (epsData.length < 2) {
        setLynchValue(null);
        setLynchUpside(null);
        return;
      }

      // Calculate EPS growth rate
      let growthRates: number[] = [];
      for (let i = 0; i < epsData.length - 1; i++) {
        const growth = (epsData[i] - epsData[i + 1]) / epsData[i + 1];
        growthRates.push(growth);
      }

      // Average EPS growth rate (cap at reasonable values)
      const avgGrowthRate = Math.min(
        Math.max(
          growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length,
          0.05 // Minimum 5% growth
        ),
        0.25 // Maximum 25% growth
      );

      // Get most recent EPS (TTM EPS)
      const currentEPS = epsData[0];

      // Use Peter Lynch's simple formula: Fair Value = Growth Rate (as %) x TTM EPS
      const growthRatePercent = avgGrowthRate * 100; // Convert to percentage
      const fairValue = growthRatePercent * currentEPS;

      // Store results
      setLynchValue(fairValue);
      setLynchUpside(((fairValue - currentPrice) / currentPrice) * 100);

      // Store assumptions
      setAssumptions((prev: any) => ({
        ...prev,
        lynch: {
          growthRate: avgGrowthRate,
          growthRatePercent: growthRatePercent,
          currentEPS,
          formula: "Growth Rate (%) × TTM EPS"
        }
      }));
    } catch (err: unknown) {
      console.error('Lynch calculation error:', err);
      setLynchValue(null);
      setLynchUpside(null);
    }
  };

  const calculateEVA = (financialData: any[], dashboardData: any, currentPrice: number) => {
    try {
      // Need at least one year of financial data
      if (!financialData.length) {
        setEvaValue(null);
        setEvaUpside(null);
        return;
      }

      // Get most recent financial data
      const recentData = financialData[0];

      // Calculate NOPAT (Net Operating Profit After Taxes)
      const operatingIncome = recentData.operatingIncome;
      if (operatingIncome === undefined || operatingIncome === null) {
        setEvaValue(null);
        setEvaUpside(null);
        return;
      }
      
      // Get effective tax rate or use default
      const taxRate = recentData.taxRateForCalcs || 
                      (recentData.incomeTaxExpense && recentData.incomeBeforeTax ? 
                       recentData.incomeTaxExpense / recentData.incomeBeforeTax : 0.21);
      
      const nopat = operatingIncome * (1 - taxRate);

      // Calculate Invested Capital properly: Equity + Debt - Cash
      const equityCapital = recentData.stockholdersEquity || 0;
      const totalDebt = recentData.totalDebt || 0;
      const cashAndEquivalents = recentData.cashAndCashEquivalents || 0;
      
      const investedCapital = equityCapital + totalDebt - cashAndEquivalents;
      
      if (investedCapital <= 0) {
        setEvaValue(null);
        setEvaUpside(null);
        return;
      }

      // Calculate ROIC (Return on Invested Capital)
      const roic = nopat / investedCapital;

      // Determine WACC (Weighted Average Cost of Capital)
      const beta = dashboardData.defaultKeyStatistics?.beta || 1;
      const riskFreeRate = 0.04; // 4% assumption for risk-free rate
      const marketRiskPremium = 0.05; // 5% assumption for market risk premium

      // Capital Asset Pricing Model (CAPM) for cost of equity
      const costOfEquity = riskFreeRate + beta * marketRiskPremium;

      // Cost of debt (using actual interest expense if available, otherwise estimate)
      const interestExpense = recentData.interestExpense || 0;
      const costOfDebt = totalDebt > 0 ? 
                         (interestExpense / totalDebt) || 0.05 : 
                         0.05; // 5% default assumption

      // Market values for capital structure
      const marketCap = dashboardData.price?.marketCap || equityCapital;
      const totalCapital = totalDebt + marketCap;
      
      // Avoid division by zero
      if (totalCapital <= 0) {
        setEvaValue(null);
        setEvaUpside(null);
        return;
      }
      
      const debtWeighting = totalDebt / totalCapital;
      const equityWeighting = marketCap / totalCapital;

      // Calculate WACC using the formula: (E/V × Re) + (D/V × Rd × (1 - Tc))
      const wacc = (equityWeighting * costOfEquity) + 
                   (debtWeighting * costOfDebt * (1 - taxRate));

      // Calculate EVA = NOPAT - (Invested Capital × WACC)
      const eva = nopat - (investedCapital * wacc);

      // Calculate EVA per share
      const sharesOutstanding =
        dashboardData.defaultKeyStatistics?.sharesOutstanding ||
        (dashboardData.price?.marketCap && currentPrice ? 
         dashboardData.price.marketCap / currentPrice : 0);
        
      if (sharesOutstanding <= 0) {
        setEvaValue(null);
        setEvaUpside(null);
        return;
      }
      
      const evaPerShare = eva / sharesOutstanding;

      // Estimate fair value by adding EVA contribution to book value
      const bookValuePerShare =
        dashboardData.defaultKeyStatistics?.bookValue ||
        (recentData.stockholdersEquity ? recentData.stockholdersEquity / sharesOutstanding : 0);

      // Fair value approximation - base on book value plus EVA contribution
      // Use higher multiple for positive EVA, lower for negative
      const evaMultiplier = evaPerShare > 0 ? 10 : 5;
      const evaFairValue = bookValuePerShare + (evaPerShare * evaMultiplier);

      // Store results
      setEvaValue(evaFairValue > 0 ? evaFairValue : null);
      setEvaUpside(evaFairValue > 0 ? ((evaFairValue - currentPrice) / currentPrice) * 100 : null);

      // Store assumptions
      setAssumptions((prev: any) => ({
        ...prev,
        eva: {
          nopat,
          wacc,
          roic,
          investedCapital,
          bookValuePerShare,
          evaPerShare,
          spreadROICWACC: roic - wacc
        }
      }));
    } catch (err: unknown) {
      console.error('EVA calculation error:', err);
      setEvaValue(null);
      setEvaUpside(null);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatValue = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toFixed(2);
  };

  // Tooltip component
  const Tooltip = ({ title, content }: { title: string; content: string }) => (
    <div className={styles.tooltipContainer}>
      <InfoOutlinedIcon fontSize="small" className={styles.infoIcon} />
      <div className={styles.tooltip}>
        <div className={styles.tooltipTitle}>{title}</div>
        <div>{content}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.modernLoadingContainer}>
        <div className={styles.loadingSpinnerLarge}></div>
        <h3>Loading Valuation Models</h3>
        <p>Calculating financial models and valuations for {symbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.modernErrorContainer}>
        <div className={styles.errorIconLarge}><FaExclamationTriangle /></div>
        <h3>Unable to Load Data</h3>
        <p>{error}</p>
        <button 
          className={styles.modernRetryButton}
          onClick={() => {
            setLoading(true);
            fetchData();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Improved check for missing data with more specific conditions
  const hasValidData = Array.isArray(financialData) && 
                      financialData.length >= 2 && 
                      dashboardData && 
                      dashboardData.price && 
                      dashboardData.price.regularMarketPrice;

  if (!hasValidData) {
    return (
      <div className={styles.container}>
        <div className={styles.enhancedNoDataMessage}>
          <FaExclamationTriangle className={styles.noDataIcon} />
          <h4>No Valuation Data Available</h4>
          <p>We couldn't calculate valuation models for {symbol} at this time. This requires at least 2 years of financial data, which may not be available for newly listed companies or those with limited financial history.</p>
          <button 
            className={styles.modernRetryButton}
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>Valuation Models</h3>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${currentTab === 0 ? styles.active : ''}`}
          onClick={() => setCurrentTab(0)}
        >
          Summary
        </button>
        <button
          className={`${styles.tab} ${currentTab === 1 ? styles.active : ''}`}
          onClick={() => setCurrentTab(1)}
        >
          Discounted Cash Flow
        </button>
        <button
          className={`${styles.tab} ${currentTab === 2 ? styles.active : ''}`}
          onClick={() => setCurrentTab(2)}
        >
          Peter Lynch
        </button>
        <button
          className={`${styles.tab} ${currentTab === 3 ? styles.active : ''}`}
          onClick={() => setCurrentTab(3)}
        >
          Economic Value Added
        </button>
      </div>

      {currentTab === 0 && (
        <div className={styles.summaryContainer}>
          <h4 className={styles.sectionTitle}>
            Valuation Summary for {dashboardData?.price?.shortName || symbol}
          </h4>

          <div className={styles.valuationCardsGrid}>
            <div className={styles.valuationCard}>
              <div className={styles.cardHeader}>
                <h5 className={styles.cardTitle}>Discounted Cash Flow</h5>
                <Tooltip
                  title="DCF Valuation"
                  content="Based on projected future cash flows discounted to present value"
                />
              </div>
              <div className={styles.valuationValue}>{formatCurrency(dcfValue)}</div>
              <p
                className={`${styles.valuationComparison} ${
                  dcfUpside !== null
                    ? dcfUpside >= 0
                      ? styles.positive
                      : styles.negative
                    : ''
                }`}
              >
                {dcfUpside === null ? (
                  'Insufficient data'
                ) : (
                  <>
                    {dcfUpside >= 0 ? (
                      <TrendingUpIcon fontSize="small" />
                    ) : (
                      <TrendingDownIcon fontSize="small" />
                    )}
                    {formatPercentage(dcfUpside)} vs current price
                  </>
                )}
              </p>
            </div>

            <div className={styles.valuationCard}>
              <div className={styles.cardHeader}>
                <h5 className={styles.cardTitle}>Peter Lynch Valuation</h5>
                <Tooltip
                  title="Lynch Valuation"
                  content="Based on earnings growth rate × TTM EPS"
                />
              </div>
              <div className={styles.valuationValue}>{formatCurrency(lynchValue)}</div>
              <p
                className={`${styles.valuationComparison} ${
                  lynchUpside !== null
                    ? lynchUpside >= 0
                      ? styles.positive
                      : styles.negative
                    : ''
                }`}
              >
                {lynchUpside === null ? (
                  'Insufficient data'
                ) : (
                  <>
                    {lynchUpside >= 0 ? (
                      <TrendingUpIcon fontSize="small" />
                    ) : (
                      <TrendingDownIcon fontSize="small" />
                    )}
                    {formatPercentage(lynchUpside)} vs current price
                  </>
                )}
              </p>
            </div>

            <div className={styles.valuationCard}>
              <div className={styles.cardHeader}>
                <h5 className={styles.cardTitle}>Economic Value Added</h5>
                <Tooltip
                  title="EVA Valuation"
                  content="Based on whether company generates returns above its cost of capital"
                />
              </div>
              <div className={styles.valuationValue}>{formatCurrency(evaValue)}</div>
              <p
                className={`${styles.valuationComparison} ${
                  evaUpside !== null
                    ? evaUpside >= 0
                      ? styles.positive
                      : styles.negative
                    : ''
                }`}
              >
                {evaUpside === null ? (
                  'Insufficient data'
                ) : (
                  <>
                    {evaUpside >= 0 ? (
                      <TrendingUpIcon fontSize="small" />
                    ) : (
                      <TrendingDownIcon fontSize="small" />
                    )}
                    {formatPercentage(evaUpside)} vs current price
                  </>
                )}
              </p>
            </div>
          </div>

          <div className={styles.footerCard}>
            <div className={styles.cardRow}>
              <span className={styles.cardLabel}>Current Price:</span>
              <span className={styles.cardValue}>
                {formatCurrency(dashboardData?.price?.regularMarketPrice || null)}
              </span>
            </div>
            <div className={styles.divider}></div>
            <p className={styles.disclaimerText}>
              Valuation models are based on historical data and assumptions. They
              should be used as one of many tools in investment analysis.
            </p>
          </div>
        </div>
      )}

      {currentTab === 1 && (
        <div className={styles.detailsContainer}>
          <h4 className={styles.sectionTitle}>Discounted Cash Flow Analysis</h4>
          <p>
            The DCF model estimates intrinsic value based on projected future free
            cash flows discounted back to present value.
          </p>

          <div className={styles.divider}></div>

          <div className={styles.twoColumnGrid}>
            <div className={styles.assumptionsCard}>
              <h5 className={styles.cardTitle}>Key Assumptions</h5>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Growth Rate:</span>
                <span className={styles.cardValue}>
                  {assumptions?.dcf?.growthRate
                    ? formatPercentage(assumptions.dcf.growthRate * 100)
                    : 'N/A'}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Discount Rate (WACC):</span>
                <span className={styles.cardValue}>
                  {assumptions?.dcf?.discountRate
                    ? formatPercentage(assumptions.dcf.discountRate * 100)
                    : 'N/A'}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Terminal Growth:</span>
                <span className={styles.cardValue}>
                  {assumptions?.dcf?.terminalGrowthRate
                    ? formatPercentage(assumptions.dcf.terminalGrowthRate * 100)
                    : 'N/A'}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Projection Years:</span>
                <span className={styles.cardValue}>
                  {assumptions?.dcf?.projectionYears || 'N/A'}
                </span>
              </div>
            </div>

            <div className={styles.resultCard}>
              <h5 className={styles.cardTitle}>DCF Valuation Result</h5>
              <div className={styles.resultValue}>{formatCurrency(dcfValue)}</div>
              <p
                className={`${styles.resultComparison} ${
                  dcfUpside !== null
                    ? dcfUpside >= 0
                      ? styles.positive
                      : styles.negative
                    : ''
                }`}
              >
                {dcfUpside === null ? (
                  'Unable to calculate'
                ) : dcfUpside >= 0 ? (
                  <>Undervalued by {formatPercentage(dcfUpside)}</>
                ) : (
                  <>Overvalued by {formatPercentage(Math.abs(dcfUpside))}</>
                )}
              </p>
            </div>
          </div>

          <h5 className={styles.sectionTitle}>Historical Cash Flows</h5>
          <p>DCF analysis uses historical free cash flows to project future performance.</p>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Free Cash Flow (millions)</th>
                </tr>
              </thead>
              <tbody>
                {financialData.slice(0, 5).map((data, index) => (
                  <tr key={index}>
                    <td>{new Date(data.date).getFullYear()}</td>
                    <td>
                      {data.freeCashFlow
                        ? `$${(data.freeCashFlow / 1000000).toFixed(2)}`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 2 && (
        <div className={styles.detailsContainer}>
          <h4 className={styles.sectionTitle}>Peter Lynch Valuation</h4>
          <p>
            The Peter Lynch approach values a company based on its earnings growth rate multiplied by its current earnings per share.
          </p>

          <div className={styles.divider}></div>

          <div className={styles.twoColumnGrid}>
            <div className={styles.assumptionsCard}>
              <h5 className={styles.cardTitle}>Lynch Method Parameters</h5>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>EPS Growth Rate:</span>
                <span className={styles.cardValue}>
                  {assumptions?.lynch?.growthRate
                    ? formatPercentage(assumptions.lynch.growthRate * 100)
                    : 'N/A'}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Current EPS:</span>
                <span className={styles.cardValue}>
                  {formatValue(assumptions?.lynch?.currentEPS)}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Formula Used:</span>
                <span className={styles.cardValue}>
                  {assumptions?.lynch?.formula || 'Growth Rate (%) × TTM EPS'}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Current P/E:</span>
                <span className={styles.cardValue}>
                  {formatValue(dashboardData?.summaryDetail?.trailingPE)}
                </span>
              </div>
            </div>

            <div className={styles.resultCard}>
              <h5 className={styles.cardTitle}>Lynch Valuation Result</h5>
              <div className={styles.resultValue}>{formatCurrency(lynchValue)}</div>
              <p
                className={`${styles.resultComparison} ${
                  lynchUpside !== null
                    ? lynchUpside >= 0
                      ? styles.positive
                      : styles.negative
                    : ''
                }`}
              >
                {lynchUpside === null ? (
                  'Unable to calculate'
                ) : lynchUpside >= 0 ? (
                  <>Undervalued by {formatPercentage(lynchUpside)}</>
                ) : (
                  <>Overvalued by {formatPercentage(Math.abs(lynchUpside))}</>
                )}
              </p>
            </div>
          </div>

          <h5 className={styles.sectionTitle}>Historical EPS</h5>
          <p>Peter Lynch valuation uses historical EPS to estimate growth rates and fair value.</p>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Diluted EPS</th>
                </tr>
              </thead>
              <tbody>
                {financialData.slice(0, 5).map((data, index) => (
                  <tr key={index}>
                    <td>{new Date(data.date).getFullYear()}</td>
                    <td>
                      {data.dilutedEPS
                        ? `$${data.dilutedEPS.toFixed(2)}`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === 3 && (
        <div className={styles.detailsContainer}>
          <h4 className={styles.sectionTitle}>Economic Value Added (EVA)</h4>
          <p>
            EVA measures whether a company is generating returns above its cost of
            capital, creating true economic value.
          </p>

          <div className={styles.divider}></div>

          <div className={styles.twoColumnGrid}>
            <div className={styles.assumptionsCard}>
              <h5 className={styles.cardTitle}>EVA Components</h5>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>
                  Net Operating Profit After Tax:
                </span>
                <span className={styles.cardValue}>
                  ${assumptions?.eva?.nopat
                    ? (assumptions.eva.nopat / 1000000).toFixed(2)
                    : 'N/A'}M
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Invested Capital:</span>
                <span className={styles.cardValue}>
                  ${assumptions?.eva?.investedCapital
                    ? (assumptions.eva.investedCapital / 1000000).toFixed(2)
                    : 'N/A'}M
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Return on Invested Capital (ROIC):</span>
                <span className={styles.cardValue}>
                  {assumptions?.eva?.roic
                    ? formatPercentage(assumptions.eva.roic * 100)
                    : 'N/A'}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Cost of Capital (WACC):</span>
                <span className={styles.cardValue}>
                  {assumptions?.eva?.wacc
                    ? formatPercentage(assumptions.eva.wacc * 100)
                    : 'N/A'}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>ROIC - WACC Spread:</span>
                <span className={`${styles.cardValue} ${
                  assumptions?.eva?.spreadROICWACC > 0 ? styles.positive : styles.negative
                }`}>
                  {assumptions?.eva?.spreadROICWACC
                    ? formatPercentage(assumptions.eva.spreadROICWACC * 100)
                    : 'N/A'}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>EVA Per Share:</span>
                <span className={styles.cardValue}>
                  {formatCurrency(assumptions?.eva?.evaPerShare)}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Book Value Per Share:</span>
                <span className={styles.cardValue}>
                  {formatCurrency(assumptions?.eva?.bookValuePerShare)}
                </span>
              </div>
            </div>
            
            <div className={styles.resultCard}>
              <h5 className={styles.cardTitle}>EVA Valuation Result</h5>
              <div className={styles.resultValue}>{formatCurrency(evaValue)}</div>
              <p
                className={`${styles.resultComparison} ${
                  evaUpside !== null
                    ? evaUpside >= 0
                      ? styles.positive
                      : styles.negative
                    : ''
                }`}
              >
                {evaUpside === null ? (
                  'Unable to calculate'
                ) : evaUpside >= 0 ? (
                  <>Undervalued by {formatPercentage(evaUpside)}</>
                ) : (
                  <>Overvalued by {formatPercentage(Math.abs(evaUpside))}</>
                )}
              </p>
            </div>
          </div>

          <h5 className={styles.sectionTitle}>Operating Performance</h5>
          <p>EVA analysis uses operating income and invested capital to determine economic profit.</p>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Operating Income ($M)</th>
                  <th>Invested Capital ($M)</th>
                </tr>
              </thead>
              <tbody>
                {financialData.slice(0, 5).map((data, index) => (
                  <tr key={index}>
                    <td>{new Date(data.date).getFullYear()}</td>
                    <td>
                      {data.operatingIncome
                        ? `$${(data.operatingIncome / 1000000).toFixed(2)}`
                        : 'N/A'}
                    </td>
                    <td>
                      {data.investedCapital
                        ? `$${(data.investedCapital / 1000000).toFixed(2)}`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValuationModels;
