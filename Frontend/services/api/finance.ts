import axios, { AxiosRequestConfig } from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:3001/api/finance';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Chart data types
export interface ChartDataPoint {
  timestamp: number;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  date?: string;
  fullDate?: Date;
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
}

// Statistics types
export interface StatisticsData {
  allTimeHigh: string;
  allTimeLow: string;
  profitDays: string;
  avgHoldPeriod: string;
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
  labels: string[];
  datasets: SeasonalityDataset[];
}

export interface SeasonalityResponse {
  daily?: SeasonalityChartData;
  weekly?: SeasonalityChartData;
  monthly?: SeasonalityChartData;
  yearly?: SeasonalityChartData;
  error?: string;
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
 * Format price to currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
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
  
  console.log(`Processed ${formattedData.length} valid data points`);
  
  if (formattedData.length === 0) {
    throw new Error('No valid data points received for the selected range and interval');
  }
  
  return formattedData;
}

/**
 * Process API response in Yahoo Finance format
 */
function processYahooFormat(result: any): ChartDataPoint[] {
  const timestamps = result.timestamp || [];
  const quotes = result.indicators.quote && result.indicators.quote.length > 0 ? 
                result.indicators.quote[0] : {};
  
  if (!timestamps || !timestamps.length || !quotes || !quotes.close) {
    console.error('Invalid data structure in API response:', { timestamps, quotes });
    throw new Error('The API returned an invalid data structure');
  }
  
  // Format data for chart - with proper date processing for display and filter out invalid points
  const formattedData = timestamps
    .map((timestamp: number, index: number) => {
      if (quotes.close[index] === null || quotes.close[index] === undefined) {
        return null;
      }
      
      const fullDate = new Date(timestamp * 1000);
      const dateStr = formatDate(fullDate);
      
      return {
        timestamp,
        close: quotes.close[index],
        open: quotes.open ? quotes.open[index] : undefined,
        high: quotes.high ? quotes.high[index] : undefined,
        low: quotes.low ? quotes.low[index] : undefined,
        volume: quotes.volume ? quotes.volume[index] : undefined,
        date: dateStr,
        fullDate
      };
    })
    .filter((point): point is ChartDataPoint => point !== null);
  
  console.log(`Processed ${formattedData.length} valid data points`);
  
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
    console.log('Fetching chart data with params:', {
      symbol,
      period1,
      period2,
      interval
    });

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
    
    console.log('API Response:', data);
    
    // Process the response data based on its format
    if (data && data.meta && data.quotes && Array.isArray(data.quotes)) {
      return processDirectFormat(data);
    } 
    // Handle Yahoo Finance API format as fallback
    else if (data && data.chart && data.chart.result && 
        data.chart.result[0] && data.chart.result[0].indicators) {
      return processYahooFormat(data.chart.result[0]);
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
    
    // Fetch data for each period
    for (const period of periods) {
      // Calculate the start date for this period
      const startDate = new Date();
      startDate.setMonth(today.getMonth() - period.months);
      
      // Format dates for API
      const fromDate = startDate.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];
      
      // Determine appropriate interval based on period length
      const interval = period.months > 60 ? '1mo' : period.months > 12 ? '1wk' : '1d';
      
      // Fetch historical data
      const params = {
        symbol,
        from: fromDate,
        to: toDate,
        interval
      };
      
      const data = await makeApiRequest<any[]>('historical', params);
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Get first and last valid closing prices
        const firstValidDataPoint = data.find(point => point.close !== null);
        const lastValidDataPoint = [...data].reverse().find(point => point.close !== null);
        
        if (firstValidDataPoint && lastValidDataPoint) {
          const startPrice = firstValidDataPoint.close;
          const endPrice = lastValidDataPoint.close;
          const performanceValue = ((endPrice - startPrice) / startPrice) * 100;
          
          results.push({
            label: period.label,
            value: performanceValue,
            months: period.months
          });
        } else {
          // Handle case where we don't have valid data points
          results.push({
            label: period.label,
            value: 0,
            months: period.months
          });
        }
      } else {
        // If no data returned, add a placeholder
        results.push({
          label: period.label,
          value: 0,
          months: period.months
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
    
    // Format dates as ISO strings
    const params = {
      symbol,
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      interval: '1mo'
    };
    
    // Call the historical API with monthly data
    const data = await makeApiRequest<HistoricalDataPoint[]>('historical', params);
    
    if (!data || !data.length) {
      throw new Error('No historical data available');
    }
    
    // Calculate annual returns from the data
    return calculateAnnualReturns(data);
    
  } catch (error) {
    console.error('Error fetching annual performance data:', error);
    throw error;
  }
}

// =============================================================================
// STATISTICS FUNCTIONS
// =============================================================================

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
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      interval: '1d'
    };
    
    const historicalData = await makeApiRequest<HistoricalDataPoint[]>('historical', params);
    
    // Process the historical data to calculate statistics
    if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
      throw new Error('No historical data available');
    }
    
    // Calculate All-Time High and All-Time Low
    let allTimeHigh = Math.max(...historicalData.map(point => point.high));
    let allTimeLow = Math.min(...historicalData.map(point => point.low));
    
    // Calculate Profit Days (days where close > open)
    const profitDays = historicalData.filter(point => point.close > point.open).length;
    const profitPercentage = (profitDays / historicalData.length) * 100;
    
    // Calculate Average Hold Period
    // For this simplified version, we'll estimate based on profitable stretches
    let totalHoldDays = 0;
    let holdPeriods = 0;
    let inProfitPeriod = false;
    let currentHoldDays = 0;
    
    historicalData.forEach((point, index) => {
      if (index > 0) {
        const isUpDay = point.close > point.open;
        
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
      allTimeHigh: formatCurrency(allTimeHigh),
      allTimeLow: formatCurrency(allTimeLow),
      profitDays: `${profitPercentage.toFixed(1)}%`,
      avgHoldPeriod: `${avgHoldYears.toFixed(1)} Years`
    };
  } catch (error) {
    console.error('Error fetching key statistics:', error);
    return {
      allTimeHigh: 'N/A',
      allTimeLow: 'N/A',
      profitDays: 'N/A',
      avgHoldPeriod: 'N/A'
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
        error: 'No dividend data available for this stock'
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
      error: null
    };
  } catch (error) {
    console.error('Error fetching dividend history:', error);
    return {
      events: [],
      chartData: null,
      error: `Failed to load dividend data: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    const fromDate = startDate.toISOString().split('T')[0];
    const toDate = endDate.toISOString().split('T')[0];
    
    const params = {
      symbol,
      from: fromDate,
      to: toDate,
      interval
    };
    
    // Fetch historical data
    const data = await makeApiRequest<HistoricalDataPoint[]>('historical', params);
    
    if (!data || data.length === 0) {
      throw new Error('No data available for the selected criteria');
    }
    
    // Process data based on view type
    let processedChartData;
    switch (viewType) {
      case 'daily':
        processedChartData = processDailyData(data, period);
        break;
      case 'monthly':
        processedChartData = processMonthlyData(data, period);
        break;
      case 'yearly':
        processedChartData = processYearlyData(data, period);
        break;
      default:
        processedChartData = processMonthlyData(data, period);
    }
    
    // Calculate statistics
    const statistics = calculateTimeAverageStats(data, viewType);
    
    return {
      chartData: processedChartData,
      statistics
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
      const years = [...new Set(data.map(point => new Date(point.date).getFullYear()))].sort();
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
      const years = [...new Set(data.map(point => new Date(point.date).getFullYear()))].sort();
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
      
      // Format dates for API
      const fromDate = from.toISOString().split('T')[0];
      const toDate = to.toISOString().split('T')[0];
      
      const params = {
        symbol,
        from: fromDate,
        to: toDate,
        interval
      };
      
      // Fetch historical data
      const data = await makeApiRequest<HistoricalDataPoint[]>('historical', params);
      
      if (!data || data.length === 0) {
        throw new Error(`No data available for ${symbol} over ${years} years`);
      }
      
      // Process data based on timeframe
      let processedData: SeasonalityDataPoint[] = [];
      
      switch (timeframe) {
        case 'daily':
          processedData = calculateDailySeasonality(data, years);
          break;
        case 'weekly':
          processedData = calculateWeeklySeasonality(data, years);
          break;
        case 'monthly':
          processedData = calculateMonthlySeasonality(data, years);
          break;
        case 'yearly':
          processedData = calculateYearlySeasonality(data, years);
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
    
    return {
      labels: periodLabels,
      datasets
    };
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
    const timeframes = ['daily', 'weekly', 'monthly', 'yearly'];
    
    const results: SeasonalityResponse = {};
    
    // Fetch data for all timeframes in parallel
    const promises = timeframes.map(timeframe => 
      fetchSeasonalityData(symbol, timeframe, periods)
        .then(data => {results[timeframe as keyof SeasonalityResponse] = data;
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
      error: error instanceof Error ? error.message : 'Unknown error fetching seasonality data'
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
    const fromDate = startDate.toISOString().split('T')[0];
    const toDate = endDate.toISOString().split('T')[0];
    
    const params = {
      symbol,
      from: fromDate,
      to: toDate,
      interval: '1mo'
    };
    
    // Fetch historical data
    const historicalData = await makeApiRequest<HistoricalDataPoint[]>('historical', params);
    
    if (!historicalData || historicalData.length === 0) {
      return {
        strongestPattern: null,
        riskPattern: null,
        monthlyDetailedData: {},
        error: 'No historical data available'
      };
    }
    
    // Analyze seasonal patterns
    return analyzeSeasonalPatterns(historicalData);
    
  } catch (error) {
    console.error('Error fetching seasonal strategy insights:', error);
    return {
      strongestPattern: null,
      riskPattern: null,
      monthlyDetailedData: {},
      error: error instanceof Error ? error.message : 'Unknown error'
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
    const firstPeriodStart = new Date(currentDate.getTime() - firstPeriodMs).toISOString();
    
    // Second period
    const secondPeriodStart = new Date(currentDate.getTime() - secondPeriodMs).toISOString();
    
    const currentDateString = currentDate.toISOString();
    
    // Make API calls to get historical data
    const [firstPeriodData, secondPeriodData] = await Promise.all([
      makeApiRequest<HistoricalDataPoint[]>('historical', {
        symbol,
        from: firstPeriodStart,
        to: currentDateString,
        interval: '1d'
      }),
      makeApiRequest<HistoricalDataPoint[]>('historical', {
        symbol,
        from: secondPeriodStart,
        to: currentDateString,
        interval: '1d'
      })
    ]);
    
    // Extract closing prices for correlation calculation
    const firstPeriodPrices = firstPeriodData.map(item => item.close);
    const secondPeriodPrices = secondPeriodData.map(item => item.close);
    
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
      }
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