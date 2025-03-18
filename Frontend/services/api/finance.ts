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
