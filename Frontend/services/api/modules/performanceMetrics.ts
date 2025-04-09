import { 
  PeriodData,
  HistoricalDataPoint,
  AnnualReturnData,
  StatisticsData 
} from '../types';
import { makeApiRequest, getDateRangeFromYears } from './utils';

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
        const firstValidDataPoint = quotes.find((point: { close: null | undefined; }) => 
          point.close !== null && point.close !== undefined);
        const lastValidDataPoint = [...quotes].reverse().find(point => 
          point.close !== null && point.close !== undefined);
        
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
    let allTimeHigh = Math.max(...historicalData.map((point: { high: any; close: any; }) => 
      point.high || point.close));
    let allTimeLow = Math.min(...historicalData.map((point: { low: any; close: any; }) => 
      point.low || point.close));
    
    // Calculate Profit Days (days where close > open)
    const profitDays = historicalData.filter((point: { close: number; open: number | undefined; }) => 
      point.open !== undefined && (point.close > point.open)).length;
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

export default {
  fetchPerformanceMetrics,
  fetchAnnualPerformance,
  fetchKeyStatistics
};
