import axios, { AxiosRequestConfig } from 'axios';

// Base API URL
const API_BASE_URL = 'http://192.168.1.98:3001/api/finance';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Chart data types
export interface ChartDataPoint {
  timestamp: number;
  close: number;
  open: number | undefined;  // Changed from optional to required but can be undefined
  high: number | undefined;  // Changed from optional to required but can be undefined
  low: number | undefined;   // Changed from optional to required but can be undefined
  volume: number | undefined; // Changed from optional to required but can be undefined
  date: string;  // Required to be string to match implementation
  fullDate: Date; // Changed to required and non-undefined since we always create a Date object
  currency?: string; // Added currency field
}

export interface ChartDataResponse {
  meta: {
    symbol: string;
    currency: string;
    exchangeName?: string;
    instrumentType?: string;
    firstTradeDate?: number;
    regularMarketTime?: number;
    gmtoffset?: number;
    timezone?: string;
    exchangeTimezoneName?: string;
    chartPreviousClose?: number;
    priceHint?: number;
  };
  quotes: {
    timestamp?: number;
    date?: string | number;
    time?: string | number;
    open?: number;
    high?: number;
    low?: number;
    close: number;
    volume?: number;
  }[];
}

export interface QuoteData {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  [key: string]: any; // For other potential fields
}

// Performance metrics types
export interface PeriodData {
  label: string;
  value: number;
  months: number;
  currency?: string; // Added currency field
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface AnnualReturnData {
  labels: string[];
  returns: number[];
  statistics: {
    bestYear: string;
    worstYear: string;
    average: string;
  };
  currency?: string; // Added currency field
}

// Statistics types
export interface StatisticsData {
  allTimeHigh: number | string ;
  allTimeLow: number | string;
  profitDays: string;
  avgHoldPeriod: string;
  currency?: string; // Added currency field
}

// Dividend types
export interface DividendEvent {
  date: string;
  timestamp: number;
  amount: number;
  fullDate: Date;
}

export interface DividendSummary {
  dividendRate?: number;
  dividendYield?: number;
  payoutRatio?: number;
  exDividendDate?: string;
  fiveYearAvgDividendYield?: number;
}

export interface DividendChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    pointRadius: number;
    pointHoverRadius: number;
    pointHoverBackgroundColor: string;
    pointHoverBorderColor: string;
    pointHoverBorderWidth: number;
  }>;
}

export interface DividendHistoryResponse {
  events: DividendEvent[];
  chartData: DividendChartData | null;
  error: string | null;
  currency?: string; // Added currency field
}

// Time Average Returns types
export interface TimeAverageReturnData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
  }>;
}

export interface ReturnStatisticData {
  period: string;
  avgReturn: number;
  stdDev: number;
  winRate: number;
  best: number;
  worst: number;
}

export interface TimeAverageReturnResponse {
  chartData: TimeAverageReturnData;
  statistics: ReturnStatisticData[];
  currency?: string; // Added currency field
}

// Seasonality types
export interface SeasonalityDataPoint {
  period: string;
  avgChange: number;
}

export interface SeasonalityDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor: string;
}

export interface SeasonalityChartData {
  currency: any;
  labels: string[];
  datasets: SeasonalityDataset[];
}

export interface SeasonalityResponse {
  daily?: SeasonalityChartData;
  weekly?: SeasonalityChartData;
  monthly?: SeasonalityChartData;
  yearly?: SeasonalityChartData;
  error?: string;
  currency?: string; // Added currency field
}

// Seasonal Strategy Insights types
export interface SeasonalPattern {
  period: string;
  return: number;
}

export interface MonthlyPerformance {
  month: string;
  avgReturn: number;
  consistency: number;
  cumulativeReturn: number;
}

export interface MonthlyStatistics {
  avgReturn: number;
  consistency: number;
  years: number;
  positiveYears: number;
  maxReturn: number;
  minReturn: number;
  volatility: number;
}

export interface SeasonalStrategyResponse {
  strongestPattern: SeasonalPattern | null;
  riskPattern: SeasonalPattern | null;
  monthlyDetailedData: Record<string, MonthlyStatistics>;
  error: string | null;
  currency?: string; // Added currency field
}

// Pattern Correlation types
export interface PatternCorrelationData {
  coefficient: number;
  strength: string;
  reliabilityScore: number;
  chartData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
      cutout: string;
    }>;
  };
  currency?: string; // Added currency field
}

// Report Insights types
export interface InsightsData {
  symbol: string;
  instrumentInfo: {
    technicalEvents: {
      provider: string;
      sector: string;
      shortTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
      intermediateTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
      longTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
    };
    keyTechnicals: {
      provider: string;
      support: number;
      resistance: number;
      stopLoss: number;
    };
    valuation: {
      color: number;
      description: string;
      discount: string;
      relativeValue: string;
      provider: string;
    };
  };
  companySnapshot: {
    sectorInfo: string;
    company: {
      innovativeness: number;
      hiring: number;
      sustainability: number;
      insiderSentiments: number;
      earningsReports: number;
      dividends: number;
    };
    sector: {
      innovativeness: number;
      hiring: number;
      sustainability: number;
      insiderSentiments: number;
      earningsReports: number;
      dividends: number;
    };
  };
  recommendation: {
    targetPrice: number;
    provider: string;
    rating: string;
  };
  upsell: {
    msBullishSummary: string[];
    msBearishSummary: string[];
    companyName: string;
    msBullishBearishSummariesPublishDate: string;
    upsellReportType: string;
  };
  events: Array<{
    eventType: string;
    pricePeriod: string;
    tradingHorizon: string;
    tradeType: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
  }>;
  reports: Array<{
    id: string;
    headHtml: string;
    provider: string;
    reportDate: string;
    reportTitle: string;
    reportType: string;
    targetPrice?: number;
    targetPriceStatus?: string;
    investmentRating?: string;
    tickers: string[];
    title: string;
  }>;
  sigDevs: Array<{
    headline: string;
    date: string;
  }>;
  secReports: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    filingDate: string;
    snapshotUrl: string;
    formType: string;
  }>;
}

// Wyckoff Indicator types
export interface WyckoffIndicatorDataPoint {
  period: string;
  value: number;
}

export interface WyckoffIndicatorData {
  labels: string[];
  indicators: number[];
  currency?: string; // Added currency field
}

// Price Volume Chart types
export interface PriceVolumeData {
  price: {
    dates: string[];
    values: number[];
  };
  volume: {
    dates: string[];
    values: number[];
  };
  priceChange: number;
  percentChange: number;
  minPrice: number;
  maxPrice: number;
  avgVolume: number;
  volumeChange: number;
  currency?: string; // Added currency field
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Common API request handler with error handling
 */
async function makeApiRequest<T>(endpoint: string, params?: any): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      params
    };
    
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error making API request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Format date to localized string
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}


/**
 * Calculate date range from years back to today
 */
function getDateRangeFromYears(years: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);
  return { startDate, endDate };
}

// =============================================================================
// CHART DATA FUNCTIONS
// =============================================================================

/**
 * Process API response in direct format (meta and quotes)
 */
function processDirectFormat(data: ChartDataResponse): ChartDataPoint[] {
  const { quotes } = data;
  
  if (quotes.length === 0) {
    throw new Error('No data available for the selected period and interval');
  }
  
  // Format data for chart - with proper date processing for display
  const formattedData = quotes
    .map((quote) => {
      // Check for essential data
      if (quote.close === null || quote.close === undefined) {
        return null;
      }
      
      // Handle timestamp which might be provided in different formats
      const timestamp = quote.timestamp || quote.date || quote.time;
      if (!timestamp) {
        return null;
      }
      
      // Convert timestamp to Date object
      const fullDate = typeof timestamp === 'number' 
        ? new Date(timestamp * 1000)  // Unix timestamp in seconds 
        : new Date(timestamp);        // ISO string or other date format
      
      const dateStr = formatDate(fullDate);
      
      return {
        timestamp: typeof timestamp === 'number' ? timestamp : fullDate.getTime() / 1000,
        close: quote.close,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        volume: quote.volume,
        date: dateStr,
        fullDate
      };
    })
    .filter((point): point is ChartDataPoint => point !== null);
    
  if (formattedData.length === 0) {
    throw new Error('No valid data points received for the selected range and interval');
  }
  
  return formattedData;
}


/**
 * Fetches historical chart data for a given financial symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param period1 - Start date in ISO format
 * @param period2 - End date in ISO format
 * @param interval - Data interval (e.g. '1d', '1wk', '1mo')
 * @returns Processed chart data
 */
export async function fetchChartData(
  symbol: string,
  period1: string,
  period2: string,
  interval: string
): Promise<ChartDataPoint[]> {
  try {
    const params = {
      symbol,
      period1,
      period2,
      interval,
      includePrePost: true,
      events: 'div|split|earn',
      lang: 'en-US',
      return: 'array',
      useYfid: true
    };

    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
        
    // Process the response data based on its format
    if (data && data.meta && data.quotes && Array.isArray(data.quotes)) {
      const chartData = processDirectFormat(data);
      // Add currency to each data point
      chartData.forEach(point => {
        point.currency = currency;
      });
      return chartData;
    } 
    else {
      console.error('Unrecognized response format:', data);
      throw new Error('The API returned an unrecognized data format');
    }
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
}

// =============================================================================
// QUOTE DATA FUNCTIONS
// =============================================================================

/**
 * Fetch quote data for a symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param fields - Optional fields to include in the response
 * @returns Quote data
 */
export async function fetchQuoteData(
  symbol: string,
  fields: string = 'shortName,longName,regularMarketPrice'
): Promise<QuoteData> {
  try {
    const params = { symbol, fields };
    const data = await makeApiRequest<any[]>('quote', params);

    // The API returns an array of quote data, get the first one
    if (data && data[0]) {
      return data[0];
    }

    throw new Error('No quote data returned');
  } catch (error) {
    console.error('Error fetching quote data:', error);
    throw error;
  }
}

// =============================================================================
// PERFORMANCE METRICS FUNCTIONS
// =============================================================================

/**
 * Fetch historical performance metrics for different time periods
 * 
 * @param symbol - Stock or asset symbol
 * @param periods - Array of period definitions with labels and months
 * @returns Array of performance metrics for each period
 */
export async function fetchPerformanceMetrics(
  symbol: string,
  periods: { label: string, months: number }[]
): Promise<PeriodData[]> {
  try {
    const today = new Date();
    const results: PeriodData[] = [];
    let currency = 'USD'; // Default currency
    
    // Fetch data for each period
    for (const period of periods) {
      // Calculate the start date for this period
      const startDate = new Date();
      startDate.setMonth(today.getMonth() - period.months);
      
      // Format dates for API
      const period1 = startDate.toISOString();
      const period2 = today.toISOString();
      
      // Determine appropriate interval based on period length
      const interval = period.months > 60 ? '1mo' : period.months > 12 ? '1wk' : '1d';
      
      // Fetch chart data with appropriate parameters
      const params = {
        symbol,
        period1,
        period2,
        interval,
        includePrePost: true,
        events: 'div|split',
        lang: 'en-US',
        return: 'array',
        useYfid: true
      };
      
      const data = await makeApiRequest<any>('chart', params);
      
      // Extract currency (use the last successful response's currency)
      if (data?.meta?.currency) {
        currency = data.meta.currency;
      }
      
      if (data && data.quotes && Array.isArray(data.quotes) && data.quotes.length > 0) {
        // Get first and last valid closing prices
        const quotes = data.quotes;
        const firstValidDataPoint = quotes.find((point: { close: null | undefined; }) => point.close !== null && point.close !== undefined);
        const lastValidDataPoint = [...quotes].reverse().find(point => point.close !== null && point.close !== undefined);
        
        if (firstValidDataPoint && lastValidDataPoint) {
          const startPrice = firstValidDataPoint.close;
          const endPrice = lastValidDataPoint.close;
          const performanceValue = ((endPrice - startPrice) / startPrice) * 100;
          
          results.push({
            label: period.label,
            value: performanceValue,
            months: period.months,
            currency: currency
          });
        } else {
          // Handle case where we don't have valid data points
          results.push({
            label: period.label,
            value: 0,
            months: period.months,
            currency: currency
          });
        }
      } else {
        // If no data returned, add a placeholder
        results.push({
          label: period.label,
          value: 0,
          months: period.months,
          currency: currency
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }
}

/**
 * Calculate annual returns from historical data
 * 
 * @param historicalData - Array of historical data points
 * @returns Formatted annual return data and statistics
 */
function calculateAnnualReturns(historicalData: HistoricalDataPoint[]): AnnualReturnData {
  // Group data by year
  const dataByYear = historicalData.reduce((acc, dataPoint) => {
    const year = new Date(dataPoint.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(dataPoint);
    return acc;
  }, {} as Record<number, HistoricalDataPoint[]>);

  // Sort years in ascending order
  const sortedYears = Object.keys(dataByYear)
    .map(Number)
    .sort((a, b) => a - b);

  // Get the most recent year data that has at least some entries
  // This handles partial current year data
  if (sortedYears.length > 0) {
    const currentYear = new Date().getFullYear();
    if (dataByYear[currentYear] && dataByYear[currentYear].length < 5) {
      // If we have very few data points for current year, exclude it
      sortedYears.pop();
    }
  }

  // Calculate returns between consecutive year-end prices
  const annualReturns: number[] = [];
  const yearLabels: string[] = [];
  
  for (let i = 1; i < sortedYears.length; i++) {
    const previousYear = sortedYears[i-1];
    const currentYear = sortedYears[i];
    
    // Get the last data point (year-end) for each year
    const previousYearEnd = dataByYear[previousYear].slice(-1)[0].adjClose;
    const currentYearEnd = dataByYear[currentYear].slice(-1)[0].adjClose;
    
    // Calculate percentage return
    const annualReturn = ((currentYearEnd - previousYearEnd) / previousYearEnd) * 100;
    annualReturns.push(parseFloat(annualReturn.toFixed(2)));
    yearLabels.push(currentYear.toString());
  }
  
  // Calculate statistics
  const statistics = { bestYear: '', worstYear: '', average: '' };
  
  if (annualReturns.length > 0) {
    const maxReturn = Math.max(...annualReturns);
    const maxIndex = annualReturns.indexOf(maxReturn);
    const bestYear = yearLabels[maxIndex];
    
    const minReturn = Math.min(...annualReturns);
    const minIndex = annualReturns.indexOf(minReturn);
    const worstYear = yearLabels[minIndex];
    
    const avgReturn = annualReturns.reduce((sum, val) => sum + val, 0) / annualReturns.length;
    
    statistics.bestYear = `${bestYear} (+${maxReturn.toFixed(1)}%)`;
    statistics.worstYear = `${worstYear} (${minReturn >= 0 ? '+' : ''}${minReturn.toFixed(1)}%)`;
    statistics.average = `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(1)}%`;
  }

  return {
    labels: yearLabels,
    returns: annualReturns,
    statistics
  };
}

/**
 * Fetches and calculates annual performance data
 * 
 * @param symbol - Stock or asset symbol
 * @param years - Number of years of historical data to fetch (default: 30)
 * @returns Formatted annual return data and statistics
 */
export async function fetchAnnualPerformance(
  symbol: string,
  years: number = 30
): Promise<AnnualReturnData> {
  try {
    const { startDate, endDate } = getDateRangeFromYears(years);
    
    // Format dates as ISO strings and update parameters for chart API
    const params = {
      symbol,
      period1: startDate.toISOString(),
      period2: endDate.toISOString(),
      interval: '1mo',
      includePrePost: true,
      events: 'div|split',
      lang: 'en-US',
      return: 'array',
      useYfid: true
    };
    
    // Call the chart API with monthly data
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    if (!data || !data.quotes || !data.quotes.length) {
      throw new Error('No historical data available');
    }
    
    // Convert to expected HistoricalDataPoint format for calculateAnnualReturns
    const historicalData = data.quotes.map((quote: any) => {
      const timestamp = quote.timestamp || quote.date;
      const date = typeof timestamp === 'number' 
        ? new Date(timestamp * 1000).toISOString() 
        : new Date(timestamp).toISOString();
        
      return {
        date,
        open: quote.open || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        close: quote.close || 0,
        volume: quote.volume || 0,
        adjClose: quote.adjClose || quote.close || 0
      };
    });
    
    // Calculate annual returns from the data
    const annualReturnData = calculateAnnualReturns(historicalData);
    // Add currency to the response
    annualReturnData.currency = currency;
    
    return annualReturnData;
    
  } catch (error) {
    console.error('Error fetching annual performance data:', error);
    throw error;
  }
}

/**
 * Fetches and calculates key statistics for a financial symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param years - Number of years to analyze (default: 20)
 * @returns Formatted statistics data
 */
export async function fetchKeyStatistics(symbol: string, years: number = 20): Promise<StatisticsData> {
  try {
    // Get historical data for the specified period
    const { startDate, endDate } = getDateRangeFromYears(years);
    
    const params = {
      symbol,
      period1: startDate.toISOString(),
      period2: endDate.toISOString(),
      interval: '1d',
      includePrePost: true,
      events: 'div|split',
      lang: 'en-US',
      return: 'array',
      useYfid: true
    };
    
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    // Process the chart data to calculate statistics
    if (!data || !data.quotes || !Array.isArray(data.quotes) || data.quotes.length === 0) {
      throw new Error('No historical data available');
    }
    
    const historicalData = data.quotes;
    
    // Calculate All-Time High and All-Time Low
    let allTimeHigh = Math.max(...historicalData.map((point: { high: any; close: any; }) => point.high || point.close));
    let allTimeLow = Math.min(...historicalData.map((point: { low: any; close: any; }) => point.low || point.close));
    
    // Calculate Profit Days (days where close > open)
    const profitDays = historicalData.filter((point: { close: number; open: number | undefined; }) => point.open !== undefined && (point.close > point.open)).length;
    const profitPercentage = (profitDays / historicalData.length) * 100;
    
    // Calculate Average Hold Period
    // For this simplified version, we'll estimate based on profitable stretches
    let totalHoldDays = 0;
    let holdPeriods = 0;
    let inProfitPeriod = false;
    let currentHoldDays = 0;
    
    historicalData.forEach((point: { close: number; open: any; }, index: number) => {
      if (index > 0) {
        const isUpDay = point.close > (point.open || 0);
        
        if (isUpDay && !inProfitPeriod) {
          // Starting a new profit period
          inProfitPeriod = true;
          currentHoldDays = 1;
        } else if (isUpDay && inProfitPeriod) {
          // Continuing profit period
          currentHoldDays++;
        } else if (!isUpDay && inProfitPeriod) {
          // End of profit period
          inProfitPeriod = false;
          totalHoldDays += currentHoldDays;
          holdPeriods++;
          currentHoldDays = 0;
        }
      }
    });
    
    // If we're still in a profit period at the end
    if (inProfitPeriod && currentHoldDays > 0) {
      totalHoldDays += currentHoldDays;
      holdPeriods++;
    }
    
    const avgHoldDays = holdPeriods > 0 ? totalHoldDays / holdPeriods : 0;
    const avgHoldYears = avgHoldDays / 365;
    
    // Format the data
    return {
      allTimeHigh: allTimeHigh,
      allTimeLow: allTimeLow,
      profitDays: `${profitPercentage.toFixed(1)}%`,
      avgHoldPeriod: `${avgHoldYears.toFixed(1)} Years`,
      currency: currency
    };
  } catch (error) {
    console.error('Error fetching key statistics:', error);
    return {
      allTimeHigh: 'N/A',
      allTimeLow: 'N/A',
      profitDays: 'N/A',
      avgHoldPeriod: 'N/A',
      currency: 'USD' // Default currency if error
    };
  }
}

// =============================================================================
// DIVIDEND FUNCTIONS
// =============================================================================

/**
 * Fetches historical dividend data for a given symbol
 * 
 * @param symbol - Stock symbol
 * @param years - Number of years to look back (default: 5)
 * @returns Dividend events and chart data
 */
export async function fetchDividendHistory(
  symbol: string,
  years: number = 5
): Promise<DividendHistoryResponse> {
  try {
    // Calculate date range
    const { startDate, endDate } = getDateRangeFromYears(years);
    
    // Fetch historical dividend data
    const params = {
      symbol,
      period1: startDate.toISOString(),
      period2: endDate.toISOString(),
      interval: '1mo',
      events: 'div'
    };
    
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    // Process dividend events from chart data
    let dividendEvents: DividendEvent[] = [];
    
    if (data && 
        data.events && 
        data.events.dividends) {
      
      const rawDividends = data.events.dividends;
      
      // Process each dividend event
      dividendEvents = rawDividends.map((dividend: any) => {
        const timestamp = dividend.date || dividend.timestamp;
        const date = new Date(parseInt(timestamp) * 1000);
        const formattedDate = `${date.getMonth() + 1}/${date.getFullYear()}`;
        return {
          date: formattedDate,
          timestamp: parseInt(timestamp),
          amount: dividend.amount,
          fullDate: date
        };
      });
      
      // Sort dividends by timestamp (oldest first)
      dividendEvents.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      return {
        events: [],
        chartData: null,
        error: 'No dividend data available for this stock',
        currency: currency
      };
    }
    
    // Prepare chart data if we have dividend events
    let chartData = null;
    if (dividendEvents.length > 0) {
      chartData = {
        labels: dividendEvents.map(div => div.date),
        datasets: [
          {
            label: 'Dividend Amount',
            data: dividendEvents.map(div => div.amount),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.2,
            pointRadius: dividendEvents.length > 20 ? 3 : 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#4CAF50',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          }
        ]
      };
    }
    
    return {
      events: dividendEvents,
      chartData,
      error: null,
      currency: currency
    };
  } catch (error) {
    console.error('Error fetching dividend history:', error);
    return {
      events: [],
      chartData: null,
      error: `Failed to load dividend data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      currency: 'USD' // Default currency if error
    };
  }
}

/**
 * Fetches dividend summary information for a stock
 * 
 * @param symbol - Stock symbol
 * @returns Dividend summary data
 */
export async function fetchDividendSummary(
  symbol: string
): Promise<DividendSummary | null> {
  try {
    const params = {
      symbol,
      modules: 'summaryDetail,defaultKeyStatistics'
    };
    
    const data = await makeApiRequest<any>('quoteSummary', params);
    
    // Extract dividend summary from quoteSummary response
    if (data && 
        data.quoteSummary && 
        data.quoteSummary.result && 
        data.quoteSummary.result[0]) {
      
      const details = data.quoteSummary.result[0];
      
      return {
        dividendRate: details.summaryDetail?.dividendRate?.raw,
        dividendYield: details.summaryDetail?.dividendYield?.raw,
        payoutRatio: details.summaryDetail?.payoutRatio?.raw,
        exDividendDate: details.summaryDetail?.exDividendDate?.fmt,
        fiveYearAvgDividendYield: details.defaultKeyStatistics?.fiveYearAvgDividendYield?.raw
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching dividend summary:', error);
    return null;
  }
}

// =============================================================================
// TIME AVERAGE RETURNS FUNCTIONS
// =============================================================================

/**
 * Fetches and processes time average returns data for a symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param period - Time period to analyze (e.g., '1 Year', '5 Years')
 * @param viewType - Type of view ('daily', 'monthly', 'yearly')
 * @returns Processed chart data and statistics
 */
export async function fetchTimeAverageReturns(
  symbol: string,
  period: string,
  viewType: string
): Promise<TimeAverageReturnResponse> {
  try {
    // Calculate date range based on selected period
    const { startDate, endDate } = getDateRangeFromPeriod(period);
    
    // Determine appropriate interval based on view type
    const interval = viewType === 'daily' ? '1d' : '1mo';
    
    // Format dates for API
    const period1 = startDate.toISOString();
    const period2 = endDate.toISOString();
    
    const params = {
      symbol,
      period1,
      period2,
      interval,
      includePrePost: true,
      events: 'div|split',
      lang: 'en-US',
      return: 'array',
      useYfid: true
    };
    
    // Fetch chart data
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    if (!data || !data.quotes || !data.quotes.length) {
      throw new Error('No data available for the selected criteria');
    }
    
    // Convert to expected HistoricalDataPoint format
    const historicalData = data.quotes.map((quote: any) => {
      const timestamp = quote.timestamp || quote.date;
      const date = typeof timestamp === 'number' 
        ? new Date(timestamp * 1000).toISOString() 
        : new Date(timestamp).toISOString();
        
      return {
        date,
        open: quote.open || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        close: quote.close || 0,
        volume: quote.volume || 0,
        adjClose: quote.adjClose || quote.close || 0
      };
    });
    
    // Process data based on view type
    let processedChartData;
    switch (viewType) {
      case 'daily':
        processedChartData = processDailyData(historicalData, period);
        break;
      case 'monthly':
        processedChartData = processMonthlyData(historicalData, period);
        break;
      case 'yearly':
        processedChartData = processYearlyData(historicalData, period);
        break;
      default:
        processedChartData = processMonthlyData(historicalData, period);
    }
    
    // Calculate statistics
    const statistics = calculateTimeAverageStats(historicalData, viewType);
    
    return {
      chartData: processedChartData,
      statistics,
      currency: currency
    };
  } catch (error) {
    console.error('Error fetching time average returns:', error);
    throw error;
  }
}

/**
 * Convert period string to date range
 */
function getDateRangeFromPeriod(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '1 Year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '3 Years':
      startDate.setFullYear(endDate.getFullYear() - 3);
      break;
    case '5 Years':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    case '10 Years':
      startDate.setFullYear(endDate.getFullYear() - 10);
      break;
    case 'Max':
      startDate.setFullYear(2000); // Arbitrary start date for "Max"
      break;
    default:
      startDate.setFullYear(endDate.getFullYear() - 5);
  }
  
  return { startDate, endDate };
}

/**
 * Process data for daily view (day of month)
 */
function processDailyData(data: HistoricalDataPoint[], period: string): TimeAverageReturnData {
  // Group returns by day of month
  const dailyReturns: { [day: number]: number[] } = {};
  
  // Initialize all days
  for (let i = 1; i <= 31; i++) {
    dailyReturns[i] = [];
  }
  
  // Calculate daily returns and group by day of month
  for (let i = 1; i < data.length; i++) {
    const previousClose = data[i-1].close;
    const currentClose = data[i].close;
    const returnPct = ((currentClose - previousClose) / previousClose) * 100;
    
    const date = new Date(data[i].date);
    const dayOfMonth = date.getDate();
    
    dailyReturns[dayOfMonth].push(returnPct);
  }
  
  // Calculate average return for each day of month
  const labels = Array.from({length: 31}, (_, i) => (i + 1).toString());
  const averageReturns = labels.map((day) => {
    const dayNum = parseInt(day);
    const returns = dailyReturns[dayNum];
    return returns.length > 0 
      ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
      : 0;
  });
  
  return {
    labels,
    datasets: [
      {
        label: `${period} Average Returns`,
        data: averageReturns,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      }
    ]
  };
}

/**
 * Process data for monthly view
 */
function processMonthlyData(data: HistoricalDataPoint[], period: string): TimeAverageReturnData {
  // Group returns by month
  const monthlyReturns: { [month: number]: number[] } = {};
  
  // Initialize all months
  for (let i = 0; i < 12; i++) {
    monthlyReturns[i] = [];
  }
  
  // Calculate monthly returns
  for (let i = 1; i < data.length; i++) {
    const previousClose = data[i-1].close;
    const currentClose = data[i].close;
    const returnPct = ((currentClose - previousClose) / previousClose) * 100;
    
    const date = new Date(data[i].date);
    const month = date.getMonth();
    
    monthlyReturns[month].push(returnPct);
  }
  
  // Calculate average return for each month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const averageReturns = monthNames.map((_, idx) => {
    const returns = monthlyReturns[idx];
    return returns.length > 0 
      ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
      : 0;
  });
  
  return {
    labels: monthNames,
    datasets: [
      {
        label: `${period} Average Returns`,
        data: averageReturns,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      }
    ]
  };
}

/**
 * Process data for yearly view
 */
function processYearlyData(data: HistoricalDataPoint[], period: string): TimeAverageReturnData {
  // Group returns by year
  const yearlyReturns: { [year: number]: number[] } = {};
  
  // Calculate yearly returns
  for (let i = 1; i < data.length; i++) {
    const previousClose = data[i-1].close;
    const currentClose = data[i].close;
    const returnPct = ((currentClose - previousClose) / previousClose) * 100;
    
    const date = new Date(data[i].date);
    const year = date.getFullYear();
    
    if (!yearlyReturns[year]) {
      yearlyReturns[year] = [];
    }
    
    yearlyReturns[year].push(returnPct);
  }
  
  // Extract unique years and sort them
  const years = Object.keys(yearlyReturns).map(Number).sort();
  
  // Calculate average return for each year
  const averageReturns = years.map(year => {
    const returns = yearlyReturns[year];
    return returns.length > 0 
      ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
      : 0;
  });
  
  return {
    labels: years.map(String),
    datasets: [
      {
        label: `${period} Average Returns`,
        data: averageReturns,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      }
    ]
  };
}

/**
 * Calculate statistics for time average returns
 */
function calculateTimeAverageStats(data: HistoricalDataPoint[], viewType: string): ReturnStatisticData[] {
  const getPeriodName = (idx: number, type: string) => {
    if (type === 'monthly') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      return monthNames[idx];
    } else if (type === 'daily') {
      return `Day ${idx + 1}`;
    } else {
      // Extract actual years from data for yearly view
      const yearsSet = new Set(data.map(point => new Date(point.date).getFullYear()));
      const years = Array.from(yearsSet).sort();
      return years[idx] ? years[idx].toString() : `Year ${idx + 1}`;
    }
  };

  // Determine number of periods based on view type
  const periodCount = viewType === 'monthly' ? 12 : (viewType === 'daily' ? 31 : 10);
  
  // Group data by respective periods
  const periodReturns: { [period: number]: number[] } = {};
  
  // Initialize all periods
  for (let i = 0; i < periodCount; i++) {
    periodReturns[i] = [];
  }
  
  // Calculate returns and group by period
  for (let i = 1; i < data.length; i++) {
    const previousClose = data[i-1].close;
    const currentClose = data[i].close;
    const returnPct = ((currentClose - previousClose) / previousClose) * 100;
    
    const date = new Date(data[i].date);
    let periodIndex: number;
    
    if (viewType === 'monthly') {
      periodIndex = date.getMonth();
    } else if (viewType === 'daily') {
      periodIndex = date.getDate() - 1;
      if (periodIndex >= periodCount) continue; // Skip days beyond 31
    } else { // yearly
      // Get unique years and map to index
      const yearsSet = new Set(data.map(point => new Date(point.date).getFullYear()));
      const years = Array.from(yearsSet).sort();
      periodIndex = years.indexOf(date.getFullYear());
      if (periodIndex === -1 || periodIndex >= periodCount) continue;
    }
    
    periodReturns[periodIndex].push(returnPct);
  }
  
  // Calculate statistics for each period
  return Object.keys(periodReturns)
    .map(Number)
    .filter(idx => idx < periodCount)
    .map(idx => {
      const returns = periodReturns[idx];
      
      if (returns.length === 0) {
        return {
          period: getPeriodName(idx, viewType),
          avgReturn: 0,
          stdDev: 0,
          winRate: 0,
          best: 0,
          worst: 0
        };
      }
      
      // Calculate average return
      const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
      
      // Calculate standard deviation
      const variance = returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate win rate
      const winningReturns = returns.filter(ret => ret > 0).length;
      const winRate = (winningReturns / returns.length) * 100;
      
      // Get best and worst returns
      const best = Math.max(...returns);
      const worst = Math.min(...returns);
      
      return {
        period: getPeriodName(idx, viewType),
        avgReturn,
        stdDev,
        winRate,
        best,
        worst
      };
    });
}

// =============================================================================
// SEASONALITY FUNCTIONS
// =============================================================================

/**
 * Fetches and processes seasonality data for a financial symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param timeframe - Timeframe to analyze ('daily', 'weekly', 'monthly', 'yearly')
 * @param periods - Array of period definitions with labels and years
 * @returns Processed seasonality data for the requested timeframe
 */
export async function fetchSeasonalityData(
  symbol: string,
  timeframe: string,
  periods: { label: string, years: number }[]
): Promise<SeasonalityChartData> {
  try {
    // Process for each period
    const datasets: SeasonalityDataset[] = [];
    let periodLabels: string[] = [];
    let currency = 'USD'; // Default currency
    
    for (const period of periods) {
      const { years } = period;
      
      // Calculate date range based on years
      const to = new Date();
      const from = new Date();
      from.setFullYear(from.getFullYear() - years);
      
      // Determine appropriate interval based on timeframe
      let interval = '1d';
      if (timeframe === 'yearly') {
        interval = '1mo'; // Monthly data for yearly analysis is sufficient
      } else if (timeframe === 'monthly' || timeframe === 'weekly') {
        interval = '1d'; // Need daily data to calculate weekly/monthly performance
      }
      
      // Format dates for chart API
      const period1 = from.toISOString();
      const period2 = to.toISOString();
      
      const params = {
        symbol,
        period1,
        period2,
        interval,
        includePrePost: true,
        events: 'div|split',
        lang: 'en-US',
        return: 'array',
        useYfid: true
      };
      
      // Fetch chart data
      const data = await makeApiRequest<any>('chart', params);
      
      // Extract currency information (use the last successful response's currency)
      if (data?.meta?.currency) {
        currency = data.meta.currency;
      }
      
      if (!data || !data.quotes || !data.quotes.length) {
        throw new Error(`No data available for ${symbol} over ${years} years`);
      }
      
      // Convert to expected HistoricalDataPoint format
      const historicalData = data.quotes.map((quote: any) => {
        const timestamp = quote.timestamp || quote.date;
        const date = typeof timestamp === 'number' 
          ? new Date(timestamp * 1000).toISOString() 
          : new Date(timestamp).toISOString();
          
        return {
          date,
          open: quote.open || 0,
          high: quote.high || 0,
          low: quote.low || 0,
          close: quote.close || 0,
          volume: quote.volume || 0,
          adjClose: quote.adjClose || quote.close || 0
        };
      });
      
      // Process data based on timeframe
      let processedData: SeasonalityDataPoint[] = [];
      
      switch (timeframe) {
        case 'daily':
          processedData = calculateDailySeasonality(historicalData, years);
          break;
        case 'weekly':
          processedData = calculateWeeklySeasonality(historicalData, years);
          break;
        case 'monthly':
          processedData = calculateMonthlySeasonality(historicalData, years);
          break;
        case 'yearly':
          processedData = calculateYearlySeasonality(historicalData, years);
          break;
      }
      
      // Extract labels (only need to do this once)
      if (periodLabels.length === 0) {
        periodLabels = processedData.map(item => item.period);
      }
      
      // Determine colors based on whether this is primary or comparison period
      const isPrimaryPeriod = periods.indexOf(period) === 0;
      
      const color = isPrimaryPeriod 
        ? 'rgba(53, 162, 235, 0.7)'  // Blue for primary period
        : 'rgba(255, 159, 64, 0.7)'; // Orange for comparison period
      
      const borderColor = isPrimaryPeriod
        ? 'rgb(53, 162, 235)'  // Solid blue for primary period
        : 'rgb(255, 159, 64)'; // Solid orange for comparison period
      
      // Create dataset
      datasets.push({
        label: period.label,
        data: processedData.map(item => item.avgChange),
        borderColor,
        backgroundColor: color
      });
    }
    
    // Add currency to each dataset
    const result = {
      labels: periodLabels,
      datasets,
      currency: currency // Add currency to chart data
    };
    
    return result;
  } catch (error) {
    console.error(`Error fetching seasonality data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Calculate daily seasonality (average % change by day of month)
 */
function calculateDailySeasonality(historicalData: HistoricalDataPoint[], years: number): SeasonalityDataPoint[] {
  // Initialize data structure for all days (1-31)
  const dayData: { [key: number]: { sum: number, count: number } } = {};
  for (let i = 1; i <= 31; i++) {
    dayData[i] = { sum: 0, count: 0 };
  }
  
  // Process each data point
  for (let i = 1; i < historicalData.length; i++) {
    const current = historicalData[i];
    const previous = historicalData[i - 1];
    
    // Skip if data is incomplete
    if (!current || !previous || !current.close || !previous.close) continue;
    
    const date = new Date(current.date);
    const dayOfMonth = date.getDate();
    
    // Calculate percent change
    const percentChange = ((current.close - previous.close) / previous.close) * 100;
    
    // Add to running total
    dayData[dayOfMonth].sum += percentChange;
    dayData[dayOfMonth].count += 1;
  }
  
  // Calculate averages and format data
  return Array.from({length: 31}, (_, i) => {
    const day = i + 1;
    const avgChange = dayData[day].count > 0 ? dayData[day].sum / dayData[day].count : 0;
    return {
      period: day.toString(),
      avgChange: Number(avgChange.toFixed(2))
    };
  });
}

/**
 * Calculate weekly seasonality (average % change by day of week)
 */
function calculateWeeklySeasonality(historicalData: HistoricalDataPoint[], years: number): SeasonalityDataPoint[] {
  const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weekdayData: { [key: number]: { sum: number, count: number } } = {};
  
  for (let i = 0; i < 5; i++) {
    weekdayData[i] = { sum: 0, count: 0 };
  }
  
  // Process each data point
  for (let i = 1; i < historicalData.length; i++) {
    const current = historicalData[i];
    const previous = historicalData[i - 1];
    
    if (!current || !previous || !current.close || !previous.close) continue;
    
    const date = new Date(current.date);
    // JavaScript getDay() returns 0-6 where 0 is Sunday and 6 is Saturday
    // We adjust to 0 = Monday, 4 = Friday
    const dayOfWeek = date.getDay();
    // Convert Sunday(0) to Monday(0) through Saturday(6) to Friday(4)
    const adjustedDay = dayOfWeek === 0 ? -1 : dayOfWeek - 1;
    
    // Skip weekends
    if (adjustedDay < 0 || adjustedDay > 4) continue;
    
    const percentChange = ((current.close - previous.close) / previous.close) * 100;
    
    weekdayData[adjustedDay].sum += percentChange;
    weekdayData[adjustedDay].count += 1;
  }
  
  return weekdayNames.map((day, index) => {
    const avgChange = weekdayData[index].count > 0 ? 
      weekdayData[index].sum / weekdayData[index].count : 0;
    return {
      period: day,
      avgChange: Number(avgChange.toFixed(2))
    };
  });
}

/**
 * Calculate monthly seasonality (average % change by month)
 */
function calculateMonthlySeasonality(historicalData: HistoricalDataPoint[], years: number): SeasonalityDataPoint[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyReturns: { [key: number]: number[] } = {};
  
  // Initialize the monthly returns array
  for (let i = 0; i < 12; i++) {
    monthlyReturns[i] = [];
  }
  
  // Group data by year-month to calculate monthly returns
  const monthlyData: { [key: string]: { open?: number, close?: number } } = {};
  
  historicalData.forEach(dataPoint => {
    if (!dataPoint || !dataPoint.close) return;
    
    const date = new Date(dataPoint.date);
    const month = date.getMonth();
    const year = date.getFullYear();
    const yearMonthKey = `${year}-${month}`;
    
    if (!monthlyData[yearMonthKey]) {
      // First entry for this month - set open price
      monthlyData[yearMonthKey] = {
        open: dataPoint.close
      };
    }
    // Always update close price (it will be the last one for the month)
    monthlyData[yearMonthKey].close = dataPoint.close;
  });
  
  // Calculate monthly returns
  Object.keys(monthlyData).forEach(yearMonthKey => {
    const [year, month] = yearMonthKey.split('-').map(Number);
    const data = monthlyData[yearMonthKey];
    
    if (data.open && data.close) {
      const monthlyReturn = ((data.close - data.open) / data.open) * 100;
      monthlyReturns[month].push(monthlyReturn);
    }
  });
  
  // Calculate average returns for each month
  return monthNames.map((name, month) => {
    const returns = monthlyReturns[month];
    const avgChange = returns.length > 0 
      ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
      : 0;
      
    return {
      period: name,
      avgChange: Number(avgChange.toFixed(2))
    };
  });
}

/**
 * Calculate yearly seasonality (average % change by year)
 */
function calculateYearlySeasonality(historicalData: HistoricalDataPoint[], years: number): SeasonalityDataPoint[] {
  if (historicalData.length === 0) return [];
  
  // Group data by year
  const yearlyData: { [key: number]: { firstDate?: string, firstPrice?: number, lastDate?: string, lastPrice?: number } } = {};
  
  // Sort data by date to ensure chronological order
  const sortedData = [...historicalData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Process data by year
  sortedData.forEach(dataPoint => {
    if (!dataPoint || !dataPoint.close) return;
    
    const date = new Date(dataPoint.date);
    const year = date.getFullYear();
    
    if (!yearlyData[year]) {
      yearlyData[year] = {
        firstDate: dataPoint.date,
        firstPrice: dataPoint.close,
        lastDate: dataPoint.date,
        lastPrice: dataPoint.close
      };
    } else {
      // Update last price (most recent for the year)
      yearlyData[year].lastDate = dataPoint.date;
      yearlyData[year].lastPrice = dataPoint.close;
    }
  });
  
  // Calculate yearly returns
  return Object.keys(yearlyData)
    .map(year => {
      const yearNum = parseInt(year);
      const { firstPrice, lastPrice } = yearlyData[yearNum];
      
      // Skip years with incomplete data
      if (firstPrice === undefined || lastPrice === undefined) {
        return {
          period: year,
          avgChange: 0
        };
      }
      
      const yearlyReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
      return {
        period: year,
        avgChange: Number(yearlyReturn.toFixed(2))
      };
    })
    .filter(item => item.avgChange !== 0); // Remove years with no data
}

/**
 * Batch fetch seasonality data for all timeframes
 * 
 * @param symbol - Stock or asset symbol
 * @param primaryPeriod - Primary period label and years
 * @param comparisonPeriod - Comparison period label and years
 * @returns Seasonality data for all timeframes
 */
export async function fetchAllSeasonalityData(
  symbol: string,
  primaryPeriod: { label: string, years: number },
  comparisonPeriod: { label: string, years: number }
): Promise<SeasonalityResponse> {
  try {
    const periods = [primaryPeriod, comparisonPeriod];
    const timeframes = ['daily', 'weekly', 'monthly', 'yearly'] as const;
    type TimeframeKey = typeof timeframes[number];
    
    const results: SeasonalityResponse = {
      currency: 'USD' // Default currency
    };
    
    // Fetch data for all timeframes in parallel
    const promises = timeframes.map(timeframe => 
      fetchSeasonalityData(symbol, timeframe, periods)
        .then(data => {
          // Use type assertion for correct assignment
          results[timeframe as TimeframeKey] = data;
          // Update the currency from any successful response
          if (data.currency) {
            results.currency = data.currency;
          }
        })
        .catch(error => {
          console.error(`Error fetching ${timeframe} data:`, error);
          // Continue with other timeframes even if one fails
        })
    );
    
    await Promise.all(promises);
    
    return results;
  } catch (error) {
    console.error(`Error fetching seasonality data for ${symbol}:`, error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error fetching seasonality data',
      currency: 'USD' // Default currency if error
    };
  }
}

// =============================================================================
// SEASONAL STRATEGY INSIGHTS FUNCTIONS
// =============================================================================

/**
 * Fetches and analyzes seasonal strategy insights for a symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param years - Number of years of historical data to analyze (default: 5)
 * @returns Seasonal strategy insights including strongest and risk patterns
 */
export async function fetchSeasonalStrategyInsights(
  symbol: string,
  years: number = 5
): Promise<SeasonalStrategyResponse> {
  try {
    // Calculate date range based on years
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - years);
    
    // Format dates for API
    const period1 = startDate.toISOString();
    const period2 = endDate.toISOString();
    
    const params = {
      symbol,
      period1,
      period2,
      interval: '1mo',
      includePrePost: true,
      events: 'div|split',
      lang: 'en-US',
      return: 'array',
      useYfid: true
    };
    
    // Fetch chart data
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    if (!data || !data.quotes || !data.quotes.length) {
      return {
        strongestPattern: null,
        riskPattern: null,
        monthlyDetailedData: {},
        error: 'No historical data available',
        currency: currency
      };
    }
    
    // Convert to expected HistoricalDataPoint format
    const historicalData = data.quotes.map((quote: any) => {
      const timestamp = quote.timestamp || quote.date;
      const date = typeof timestamp === 'number' 
        ? new Date(timestamp * 1000).toISOString() 
        : new Date(timestamp).toISOString();
        
      return {
        date,
        open: quote.open || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        close: quote.close || 0,
        volume: quote.volume || 0,
        adjClose: quote.adjClose || quote.close || 0
      };
    });
    
    // Analyze seasonal patterns
    const result = analyzeSeasonalPatterns(historicalData);
    // Add currency to result
    result.currency = currency;
    
    return result;
    
  } catch (error) {
    console.error('Error fetching seasonal strategy insights:', error);
    return {
      strongestPattern: null,
      riskPattern: null,
      monthlyDetailedData: {},
      error: error instanceof Error ? error.message : 'Unknown error',
      currency: 'USD' // Default currency if error
    };
  }
}

/**
 * Analyzes historical data to detect seasonal patterns
 * 
 * @param historicalData - Array of historical data points
 * @returns Seasonal strategy insights
 */
function analyzeSeasonalPatterns(historicalData: HistoricalDataPoint[]): SeasonalStrategyResponse {
  // Group data by month
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const monthlyReturns: Record<string, number[]> = {};
  monthNames.forEach(month => monthlyReturns[month] = []);
  
  // Calculate monthly returns
  for (let i = 1; i < historicalData.length; i++) {
    const currentData = historicalData[i];
    const previousData = historicalData[i-1];
    
    const date = new Date(currentData.date);
    const month = monthNames[date.getMonth()];
    
    // Calculate monthly return (%)
    const monthlyReturn = ((currentData.close - previousData.close) / previousData.close) * 100;
    monthlyReturns[month].push(monthlyReturn);
  }
  
  // Calculate detailed monthly statistics for strategy exploration
  const monthlyDetailedData: Record<string, MonthlyStatistics> = {};
  
  monthNames.forEach(month => {
    const returns = monthlyReturns[month];
    if (returns.length > 0) {
      const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
      const positiveReturns = returns.filter(ret => ret > 0);
      const consistency = (positiveReturns.length / returns.length) * 100;
      
      monthlyDetailedData[month] = {
        avgReturn,
        consistency,
        years: returns.length,
        positiveYears: positiveReturns.length,
        maxReturn: Math.max(...returns),
        minReturn: Math.min(...returns),
        volatility: calculateStandardDeviation(returns)
      };
    }
  });
  
  // Find best consecutive 3-4 month period
  const seasonalPatterns: {start: number; end: number; return: number}[] = [];
  
  for (let start = 0; start < 12; start++) {
    for (let length = 3; length <= 4; length++) {
      let totalReturn = 0;
      let isValid = true;
      
      for (let i = 0; i < length; i++) {
        const monthIndex = (start + i) % 12;
        const month = monthNames[monthIndex];
        
        if (monthlyReturns[month].length === 0) {
          isValid = false;
          break;
        }
        
        const avgReturn = monthlyReturns[month].reduce((sum, val) => sum + val, 0) / monthlyReturns[month].length;
        totalReturn += avgReturn;
      }
      
      if (isValid) {
        seasonalPatterns.push({
          start,
          end: (start + length - 1) % 12,
          return: totalReturn
        });
      }
    }
  }
  
  // Find strongest positive pattern
  let strongestPattern: SeasonalPattern | null = null;
  const bestPattern = seasonalPatterns.sort((a, b) => b.return - a.return)[0];
  if (bestPattern) {
    strongestPattern = {
      period: `${monthNames[bestPattern.start]} to ${monthNames[bestPattern.end]}`,
      return: bestPattern.return
    };
  }
  
  // Find worst month (risk pattern)
  let riskPattern: SeasonalPattern | null = null;
  const monthlyAvgReturns = monthNames.map(month => {
    const returns = monthlyReturns[month];
    const avgReturn = returns.length > 0 
      ? returns.reduce((sum, val) => sum + val, 0) / returns.length
      : 0;
    return { month, avgReturn };
  });
  
  const worstMonth = monthlyAvgReturns
    .filter(m => m.avgReturn < 0 && monthlyReturns[m.month].length > 0)
    .sort((a, b) => a.avgReturn - b.avgReturn)[0];
    
  if (worstMonth) {
    riskPattern = {
      period: worstMonth.month,
      return: worstMonth.avgReturn
    };
  }
  
  return {
    strongestPattern,
    riskPattern,
    monthlyDetailedData,
    error: null
  };
}

/**
 * Calculate standard deviation (volatility) of values
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// =============================================================================
// PATTERN CORRELATION FUNCTIONS
// =============================================================================

/**
 * Fetches and calculates pattern correlation between two time periods
 * 
 * @param symbol - Stock or asset symbol
 * @param firstPeriod - First time period in years (e.g., '3 Years')
 * @param secondPeriod - Second time period in years (e.g., '5 Years') 
 * @returns Correlation data including coefficient, strength, and chart data
 */
export async function fetchPatternCorrelation(
  symbol: string,
  firstPeriod: string,
  secondPeriod: string
): Promise<PatternCorrelationData> {
  try {
    const currentDate = new Date();
    
    // Calculate date ranges based on selected periods
    const firstPeriodMs = periodToMs(firstPeriod);
    const secondPeriodMs = periodToMs(secondPeriod);
    
    // First period
    const firstPeriodStart = new Date(currentDate.getTime() - firstPeriodMs);
    const firstPeriodEnd = new Date(currentDate);
    
    // Second period
    const secondPeriodStart = new Date(currentDate.getTime() - secondPeriodMs);
    const secondPeriodEnd = new Date(currentDate);
    
    // Make API calls to get chart data
    const [firstPeriodResponse, secondPeriodResponse] = await Promise.all([
      makeApiRequest<any>('chart', {
        symbol,
        period1: firstPeriodStart.toISOString(),
        period2: firstPeriodEnd.toISOString(),
        interval: '1d',
        includePrePost: true,
        events: 'div|split',
        lang: 'en-US',
        return: 'array',
        useYfid: true
      }),
      makeApiRequest<any>('chart', {
        symbol,
        period1: secondPeriodStart.toISOString(),
        period2: secondPeriodEnd.toISOString(),
        interval: '1d',
        includePrePost: true,
        events: 'div|split',
        lang: 'en-US',
        return: 'array',
        useYfid: true
      })
    ]);
    
    // Extract currency (use the first response's currency)
    const currency = firstPeriodResponse?.meta?.currency || secondPeriodResponse?.meta?.currency || 'USD';
    
    // Extract closing prices for correlation calculation
    const firstPeriodData = firstPeriodResponse?.quotes || [];
    const secondPeriodData = secondPeriodResponse?.quotes || [];
    
    const firstPeriodPrices = firstPeriodData.map((item: any) => item.close);
    const secondPeriodPrices = secondPeriodData.map((item: any) => item.close);
    
    // Calculate correlation coefficient
    const coefficient = calculateCorrelation(firstPeriodPrices, secondPeriodPrices);
    const correlationPercentage = Math.abs(coefficient) * 100;
    
    // Determine strength and reliability
    const strength = getCorrelationStrength(coefficient);
    const reliabilityScore = calculateReliabilityScore(
      coefficient, 
      Math.min(firstPeriodPrices.length, secondPeriodPrices.length)
    );
    
    // Get the correlation color for visual feedback
    const correlationColor = getCorrelationColor(coefficient);
    
    return {
      coefficient: parseFloat(coefficient.toFixed(2)),
      strength,
      reliabilityScore,
      chartData: {
        labels: ['Correlation', 'No Correlation'],
        datasets: [
          {
            data: [correlationPercentage, 100 - correlationPercentage],
            backgroundColor: [
              correlationColor,
              'rgba(230, 230, 230, 0.5)'
            ],
            borderWidth: 0,
            cutout: '75%'
          }
        ]
      },
      currency: currency
    };
  } catch (error) {
    console.error('Error fetching pattern correlation data:', error);
    throw error;
  }
}

/**
 * Helper function to convert period strings to milliseconds
 */
function periodToMs(period: string): number {
  const value = parseInt(period);
  if (period.includes('Year')) {
    return value * 365 * 24 * 60 * 60 * 1000;
  }
  return 365 * 24 * 60 * 60 * 1000; // default to 1 year
}

/**
 * Calculate correlation between two datasets
 */
function calculateCorrelation(dataset1: number[], dataset2: number[]): number {
  if (dataset1.length === 0 || dataset2.length === 0) return 0;
  
  // Ensure datasets are the same length by using the smaller one
  const length = Math.min(dataset1.length, dataset2.length);
  dataset1 = dataset1.slice(0, length);
  dataset2 = dataset2.slice(0, length);
  
  // Calculate mean
  const mean1 = dataset1.reduce((sum, val) => sum + val, 0) / length;
  const mean2 = dataset2.reduce((sum, val) => sum + val, 0) / length;
  
  // Calculate correlation coefficient
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  for (let i = 0; i < length; i++) {
    const diff1 = dataset1[i] - mean1;
    const diff2 = dataset2[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }
  
  if (denominator1 === 0 || denominator2 === 0) return 0;
  
  return numerator / Math.sqrt(denominator1 * denominator2);
}

/**
 * Determine correlation strength as text
 */
function getCorrelationStrength(coefficient: number): string {
  const absCoefficient = Math.abs(coefficient);
  if (absCoefficient > 0.7) return 'Strong';
  if (absCoefficient > 0.5) return 'Moderate';
  if (absCoefficient > 0.3) return 'Weak';
  return 'Very Weak';
}

/**
 * Get color based on correlation value
 */
function getCorrelationColor(coefficient: number): string {
  const absValue = Math.abs(coefficient);
  if (absValue > 0.7) return '#20a0b8';  // Strong - teal
  if (absValue > 0.5) return '#5e88fc';  // Moderate - blue
  if (absValue > 0.3) return '#ba68c8';  // Weak - purple
  return '#9e9e9e';  // Very Weak - gray
}

/**
 * Calculate reliability score based on data size and correlation strength
 */
function calculateReliabilityScore(coefficient: number, dataSize: number): number {
  const baseScore = Math.abs(coefficient) * 100;
  // Adjust based on data size (more data = more reliable)
  const dataSizeFactor = Math.min(1, dataSize / 250); // 250 days (~1 trading year) is considered full reliability
  return Math.round(baseScore * (0.7 + 0.3 * dataSizeFactor));
}

// =============================================================================
// REPORT INSIGHTS FUNCTIONS
// =============================================================================

/**
 * Fetches comprehensive insights data for a financial symbol
 * 
 * @param symbol - Stock or asset symbol
 * @returns Detailed insights data including technical analysis, company snapshot, and recommendations
 */
export async function fetchInsightsData(symbol: string): Promise<InsightsData> {
  try {
    const params = { symbol };
    const data = await makeApiRequest<InsightsData>('insights', params);
    return data;
  } catch (error) {
    console.error('Error fetching insights data:', error);
    throw error;
  }
}

// =============================================================================
// WYCKOFF INDICATOR FUNCTIONS
// =============================================================================

/**
 * Converts a timeframe string to a date range with appropriate interval
 * 
 * @param timeframe - String representation of the timeframe (e.g., '1y', '6m', '1w')
 * @returns Object with from date, to date, and appropriate interval
 */
function timeframeToDateRange(timeframe: string): { from: string; to: string; interval: string } {
  const now = new Date();
  const endDate = now.toISOString();
  let startDate;
  let interval = '1d';
  
  switch (timeframe) {
    case '1w':
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      interval = '60m';
      break;
    case '3d':
      startDate = new Date(now.setDate(now.getDate() - 3)).toISOString();
      interval = '30m';
      break;
    case 'd':
      startDate = new Date(now.setDate(now.getDate() - 1)).toISOString();
      interval = '5m';
      break;
    case 'w':
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      interval = '60m';
      break;
    case '1m':
      startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      interval = '1d';
      break;
    case '6m':
      startDate = new Date(now.setMonth(now.getMonth() - 6)).toISOString();
      interval = '1d';
      break;
    case '1y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      interval = '1d';
      break;
    case '3y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 3)).toISOString();
      interval = '1wk';
      break;
    case '5y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 5)).toISOString();
      interval = '1wk';
      break;
    default:
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      interval = '1d';
  }
  
  return { from: startDate, to: endDate, interval };
}

/**
 * Calculate the Wyckoff Causes/Effects indicator based on price and volume data
 * This combines momentum and supply/demand factors to create an oscillating indicator
 * 
 * @param timestamps - Array of timestamps
 * @param quotes - Object containing price and volume data arrays
 * @returns Processed Wyckoff indicator data
 */
function calculateWyckoffIndicator(timestamps: any[], quotes: any): WyckoffIndicatorData {
  if (!timestamps.length || !quotes.close || !quotes.volume) {
    return { labels: [], indicators: [] };
  }
  
  const closes = quotes.close;
  const volumes = quotes.volume;
  const highs = quotes.high;
  const lows = quotes.low;
  
  const labels: string[] = [];
  const indicators: number[] = [];
  
  // We need at least 14 data points to calculate meaningful indicators
  const lookback = Math.min(14, closes.length - 1);
  
  // Process the data
  for (let i = lookback; i < closes.length; i++) {
    // Format date from timestamp
    // Handle both timestamp number and date string formats
    const date = typeof timestamps[i] === 'number' 
      ? new Date(timestamps[i] * 1000) 
      : new Date(timestamps[i]);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Calculate price momentum (rate of change over lookback period)
    const priceChange = closes[i] / closes[i - lookback] - 1;
    
    // Calculate volume trend (is volume increasing or decreasing?)
    let volumeSum = 0;
    let prevVolumeSum = 0;
    
    for (let j = 0; j < lookback; j++) {
      if (volumes[i - j]) volumeSum += volumes[i - j];
      if (volumes[i - j - lookback]) prevVolumeSum += volumes[i - j - lookback];
    }
    
    const volumeTrend = prevVolumeSum > 0 ? volumeSum / prevVolumeSum - 1 : 0;
    
    // Calculate price range volatility
    let trueRange = 0;
    for (let j = 0; j < lookback; j++) {
      if (highs[i - j] && lows[i - j]) {
        const prevClose = i - j - 1 >= 0 ? closes[i - j - 1] : closes[i - j];
        const currentTR = Math.max(
          highs[i - j] - lows[i - j],
          Math.abs(highs[i - j] - prevClose),
          Math.abs(lows[i - j] - prevClose)
        );
        trueRange += currentTR;
      }
    }
    trueRange /= lookback;
    
    // Normalize the true range
    const normalizedTrueRange = trueRange / closes[i] * 100;
    
    // Calculate Wyckoff Indicator combining price momentum, volume trend, and volatility
    // This is a simplified interpretation of Wyckoff principles
    const wyckoffIndicator = (priceChange * 10) * (1 + volumeTrend * 0.5) * (1 - normalizedTrueRange * 0.05);
    
    // Scale the indicator to fit within our chart range (-15 to 15)
    const scaledIndicator = Math.max(Math.min(wyckoffIndicator * 100, 15), -15);
    
    indicators.push(scaledIndicator);
  }
  
  return { labels, indicators };
}

/**
 * Fetches chart data and calculates Wyckoff indicator values
 * 
 * @param symbol - Stock or asset symbol
 * @param timeframe - Time period to analyze (e.g., '1y', '6m', '1w')
 * @returns Processed Wyckoff indicator data
 */
export async function fetchWyckoffIndicatorData(symbol: string, timeframe: string): Promise<WyckoffIndicatorData> {
  try {
    // Convert timeframe to date range parameters
    const period = timeframeToDateRange(timeframe);

    // Fetch the chart data
    const params = {
      symbol,
      period1: period.from,
      period2: period.to,
      interval: period.interval,
      includePrePost: true,
      events: 'div|split|earn'
    };
    
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    // Extract data from response
    if (data && data.quotes && data.quotes.length > 0) {
      // Extract quotes array
      const quotes = data.quotes;
      
      // Extract necessary data points for Wyckoff calculation
      const timestamps = quotes.map((q: any) => q.date || q.timestamp);
      const closes = quotes.map((q: any) => q.close || q.adjclose);
      const volumes = quotes.map((q: any) => q.volume);
      const highs = quotes.map((q: any) => q.high);
      const lows = quotes.map((q: any) => q.low);
      
      // Create consolidated data structure for the calculation
      const quoteData = {
        close: closes,
        volume: volumes,
        high: highs,
        low: lows
      };
      
      // Process data for Wyckoff indicator
      const wyckoffData = calculateWyckoffIndicator(timestamps, quoteData);
      // Add currency to result
      wyckoffData.currency = currency;
      
      return wyckoffData;
    } else {
      throw new Error('Invalid data format received from API');
    }
  } catch (error) {
    console.error('Failed to load Wyckoff indicator data:', error);
    throw error;
  }
}

// =============================================================================
// PRICE VOLUME CHART FUNCTIONS
// =============================================================================

/**
 * Fetches and processes price and volume data for a given symbol and time period
 * 
 * @param symbol - Stock or asset symbol
 * @param period - Time period to analyze (e.g., '1d', '5d', '1mo', '3mo', '6mo', '1y', '5y')
 * @returns Processed price and volume data ready for charting
 */
export async function fetchPriceVolumeData(
  symbol: string,
  period: string = '3mo'
): Promise<PriceVolumeData> {
  try {
    // Convert period to date range
    const { from, to } = getPeriodDateRange(period);
    
    // Choose appropriate interval based on period
    const interval = getIntervalForPeriod(period);
    
    // Fetch the data
    const params = {
      symbol,
      period1: from,
      period2: to,
      interval,
    };
    
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    // Process the data
    if (!data || !data.quotes || !Array.isArray(data.quotes) || data.quotes.length === 0) {
      throw new Error('Invalid data received from API');
    }
    
    const quotes = data.quotes;
    
    // Extract price and volume data
    const prices: number[] = [];
    const volumes: number[] = [];
    const dates: string[] = [];
    
    quotes.forEach((quote: any) => {
      if (quote.close !== null && quote.close !== undefined) {
        prices.push(quote.close);
        volumes.push(quote.volume || 0);
        
        // Format date
        const timestamp = quote.timestamp || quote.date;
        const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
        dates.push(formatDate(date));
      }
    });
    
    // Calculate statistics
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const priceChange = lastPrice - firstPrice;
    const percentChange = (priceChange / firstPrice) * 100;
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Volume stats
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const firstVolume = volumes[0];
    const lastVolume = volumes[volumes.length - 1];
    const volumeChange = ((lastVolume - firstVolume) / firstVolume) * 100;
    
    return {
      price: {
        dates,
        values: prices
      },
      volume: {
        dates,
        values: volumes
      },
      priceChange,
      percentChange,
      minPrice,
      maxPrice,
      avgVolume,
      volumeChange,
      currency: currency
    };
  } catch (error) {
    console.error('Error fetching price-volume data:', error);
    throw error;
  }
}

/**
 * Converts a period string to start and end dates
 */
function getPeriodDateRange(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  let from: Date;
  
  switch (period) {
    case '1d':
      from = new Date(now.setDate(now.getDate() - 1));
      break;
    case '5d':
      from = new Date(now.setDate(now.getDate() - 5));
      break;
    case '1mo':
      from = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case '3mo':
      from = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case '6mo':
      from = new Date(now.setMonth(now.getMonth() - 6));
      break;
    case '1y':
      from = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case '2y':
      from = new Date(now.setFullYear(now.getFullYear() - 2));
      break;
    case '5y':
      from = new Date(now.setFullYear(now.getFullYear() - 5));
      break;
    case 'max':
      from = new Date(now.setFullYear(1900)); // Arbitrary distant past date
      break;
    default:
      from = new Date(now.setMonth(now.getMonth() - 3)); // Default to 3 months
  }
  
  return { from: from.toISOString(), to };
}

/**
 * Determines appropriate data interval based on the time period
 */
function getIntervalForPeriod(period: string): string {
  switch (period) {
    case '1d':
      return '5m';  // 5-minute intervals for 1 day
    case '5d':
      return '30m'; // 30-minute intervals for 5 days
    case '1mo':
      return '1d';  // 1-day intervals for 1 month
    case '3mo':
    case '6mo':
      return '1d';  // 1-day intervals for 3-6 months
    case '1y':
    case '2y':
      return '1d';  // 1-day intervals for 1-2 years
    case '5y':
    case 'max':
      return '1wk'; // 1-week intervals for 5+ years
    default:
      return '1d';  // Default to daily data
  }
}

// =============================================================================
// ANALYSIS DATA TYPES
// =============================================================================

export interface AnalysisData {
  recommendationTrend?: any;
  earningsHistory?: any;
  earningsTrend?: any;
  calendarEvents?: any;
  [key: string]: any;
}

// =============================================================================
// FUNDAMENTAL ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Fetches fundamental analysis data for a given symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param modules - Array of data modules to fetch (e.g., 'recommendationTrend', 'earningsHistory')
 * @returns Analysis data from various modules
 */
export async function fetchAnalysisData(
  symbol: string,
  modules: string[] = ['recommendationTrend', 'earningsHistory', 'earningsTrend', 'calendarEvents']
): Promise<AnalysisData> {
  try {
    const params = {
      symbol,
      modules: modules.join(',')
    };
    
    const data = await makeApiRequest<AnalysisData>('quoteSummary', params);
    return data;
  } catch (error) {
    console.error('Error fetching analysis data:', error);
    throw error;
  }
}

// =============================================================================
// FINANCIAL STATEMENTS DATA TYPES
// =============================================================================

export interface FinancialData {
  incomeStatementHistory?: any;
  incomeStatementHistoryQuarterly?: any;
  balanceSheetHistory?: any;
  balanceSheetHistoryQuarterly?: any;
  cashflowStatementHistory?: any;
  cashflowStatementHistoryQuarterly?: any;
  [key: string]: any;
}

// =============================================================================
// FINANCIAL STATEMENTS FUNCTIONS
// =============================================================================

/**
 * Fetches financial statement data for a given symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param modules - Array of financial statement modules to fetch
 * @returns Financial statement data
 */
export async function fetchFinancialData(
  symbol: string,
  modules: string[] = [
    'incomeStatementHistory', 
    'incomeStatementHistoryQuarterly', 
    'balanceSheetHistory', 
    'balanceSheetHistoryQuarterly',
    'cashflowStatementHistory', 
    'cashflowStatementHistoryQuarterly'
  ]
): Promise<FinancialData> {
  try {
    const params = {
      symbol,
      modules: modules.join(',')
    };
    
    const data = await makeApiRequest<FinancialData>('quoteSummary', params);
    return data;
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw error;
  }
}

// =============================================================================
// STOCK DASHBOARD DATA TYPES
// =============================================================================

export interface QuoteSummaryData {
  price?: any;
  summaryDetail?: any;
  defaultKeyStatistics?: any;
  [key: string]: any;
}

// =============================================================================
// STOCK DASHBOARD FUNCTIONS
// =============================================================================

/**
 * Fetches stock dashboard data including price, summary details, and key statistics
 * 
 * @param symbol - Stock or asset symbol
 * @param modules - Optional array of data modules to fetch
 * @returns Stock dashboard data with price, summary details, and key statistics
 */
export async function fetchStockDashboardData(
  symbol: string,
  modules: string[] = ['price', 'summaryDetail', 'defaultKeyStatistics']
): Promise<QuoteSummaryData> {
  try {
    const params = {
      symbol,
      modules: modules.join(',')
    };
    
    const data = await makeApiRequest<QuoteSummaryData>('quoteSummary', params);
    return data;
  } catch (error) {
    console.error('Error fetching stock dashboard data:', error);
    throw error;
  }
}

// =============================================================================
// COMPANY PROFILE DATA TYPES
// =============================================================================

export interface CompanyProfile {
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  website?: string;
  industry?: string;
  sector?: string;
  longBusinessSummary?: string;
  fullTimeEmployees?: number;
}

// =============================================================================
// COMPANY PROFILE FUNCTIONS
// =============================================================================

/**
 * Fetches company profile information for a given symbol
 * 
 * @param symbol - Stock or company symbol
 * @returns Company profile data
 */
export async function fetchCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const params = {
      symbol,
      modules: 'summaryProfile'
    };
    
    const data = await makeApiRequest<any>('quoteSummary', params);
    
    if (data && data.summaryProfile) {
      return data.summaryProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
}

// =============================================================================
// SEARCH DATA TYPES
// =============================================================================

export interface SearchResult {
  symbol: string;
  shortName?: string;
  exchange?: string;
}

// =============================================================================
// SEARCH FUNCTIONS
// =============================================================================

/**
 * Searches for stocks, ETFs and other financial instruments by name or ticker
 * 
 * @param query - Search term
 * @param limit - Maximum number of results to return
 * @returns Array of search results
 */
export async function searchSymbols(
  query: string,
  limit: number = 100
): Promise<SearchResult[]> {
  try {
    if (!query.trim()) {
      return [];
    }
    
    const params = {
      query,
      limit: limit.toString()
    };
    
    const data = await makeApiRequest<any[]>('search', params);
    debugger
    if (data && Array.isArray(data) && data.length > 0) {
      return data.map(quote => ({
        symbol: quote.symbol,
        shortName: quote.longname || quote.shortname ||'',
        exchange: quote.exchDisp || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}

// =============================================================================
// INSIDER AND INSTITUTIONAL OWNERSHIP DATA TYPES
// =============================================================================

export interface InsiderHolder {
  maxAge: number;
  name: string;
  relation: string;
  url: string;
  transactionDescription: string;
  latestTransDate: Date;
  positionDirect: number;
  positionDirectDate: Date;
}

export interface InsiderTransaction {
  [x: string]: any;
  maxAge: number;
  shares: number;
  value: number;
  filerUrl: string;
  transactionText: string;
  filerName: string;
  filerRelation: string;
  moneyText: string;
  startDate: Date;
  ownership: string;
}

export interface InstitutionalOwner {
  maxAge: number;
  reportDate: Date;
  organization: string;
  pctHeld: number;
  position: number;
  value: number;
}

export interface InsiderOwnershipData {
  insiderHolders: InsiderHolder[];
  insiderTransactions: InsiderTransaction[];
  institutionalOwners: InstitutionalOwner[];
  error: string | null;
  currency: string;
}

// =============================================================================
// INSIDER AND INSTITUTIONAL OWNERSHIP FUNCTIONS
// =============================================================================

/**
 * Fetches insider and institutional ownership data for a given symbol
 * 
 * @param symbol - Stock symbol
 * @returns Insider holders, transactions, and institutional ownership data
 */
export async function fetchInsiderAndInstitutionalData(
  symbol: string
): Promise<InsiderOwnershipData> {
  try {
    const params = {
      symbol,
      modules: 'insiderHolders,insiderTransactions,institutionOwnership'
    };
    
    const data = await makeApiRequest<any>('quoteSummary', params);
    
    // Extract currency information (default to USD if not available)
    const currency = data?.price?.currency || 'USD';
    
    // Process insider holders data
    const insiderHolders: InsiderHolder[] = [];
    if (data?.insiderHolders?.holders) {
      data.insiderHolders.holders.forEach((holder: any) => {
        insiderHolders.push({
          maxAge: holder.maxAge || 0,
          name: holder.name || '',
          relation: holder.relation || '',
          url: holder.url || '',
          transactionDescription: holder.transactionDescription || '',
          latestTransDate: new Date(holder.latestTransDate?.raw ? holder.latestTransDate.raw * 1000 : 0), 
          positionDirect: holder.positionDirect?.raw || 0,
          positionDirectDate: new Date(holder.positionDirectDate?.raw ? holder.positionDirectDate.raw * 1000 : 0)
        });
      });
    }
    
    // Process insider transactions data
    const insiderTransactions: InsiderTransaction[] = [];
    if (data?.insiderTransactions?.transactions) {
      data.insiderTransactions.transactions.forEach((transaction: any) => {
        insiderTransactions.push({
          maxAge: transaction.maxAge || 0,
          shares: transaction.shares?.raw || 0,
          value: transaction.value?.raw || 0,
          filerUrl: transaction.filerUrl || '',
          transactionText: transaction.transactionText || '',
          filerName: transaction.filerName || '',
          filerRelation: transaction.filerRelation || '',
          moneyText: transaction.moneyText || '',
          startDate: new Date(transaction.startDate?.raw ? transaction.startDate.raw * 1000 : 0),
          ownership: transaction.ownership || ''
        });
      });
    }
    
    // Process institutional owners data
    const institutionalOwners: InstitutionalOwner[] = [];
    if (data?.institutionOwnership?.ownershipList) {
      debugger
      data.institutionOwnership.ownershipList.forEach((owner: any) => {
        const reportDate = owner.reportDate?.raw 
          ? new Date(owner.reportDate.raw * 1000) 
          : new Date(owner.reportDate || 0);

        institutionalOwners.push({
          maxAge: owner.maxAge || 0,
          reportDate: reportDate,
          organization: owner.organization || '',
          pctHeld: owner.pctHeld || 0,
          position: owner.position || 0,
          value: owner.value?.raw || 0
        });
      });
    }
    
    return {
      insiderHolders,
      insiderTransactions,
      institutionalOwners,
      error: null,
      currency
    };
  } catch (error) {
    console.error('Error fetching insider and institutional ownership data:', error);
    return {
      insiderHolders: [],
      insiderTransactions: [],
      institutionalOwners: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      currency: 'USD' // Default currency if error
    };
  }
}