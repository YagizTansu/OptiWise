import { 
  HistoricalDataPoint,
  SeasonalityDataPoint,
  SeasonalityDataset,
  SeasonalityChartData,
  SeasonalityResponse
} from '../types';
import { makeApiRequest } from './utils';

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
      let to = new Date();
      let from = new Date();

      if (years === 0) {
        to = new Date();
        from = new Date(to.getFullYear(), 0, 1); // January 1st of current year
        from.setFullYear(from.getFullYear() - years);
      }
      else if (years === 1) {
        const year = new Date().getFullYear() - 1;
        from = new Date(year, 0, 1, 0, 0, 0, 0); // January 1st of last year
        to = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of last year
      } else {
        to = new Date();
        from = new Date();
        from.setFullYear(from.getFullYear() - years);
      }
      
      // Determine appropriate interval
      let interval = '1d';
      
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

export default {
  fetchSeasonalityData,
  fetchAllSeasonalityData
};
