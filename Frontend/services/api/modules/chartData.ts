import { ChartDataResponse, ChartDataPoint } from '../types';
import { makeApiRequest, formatDate } from './utils';

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

export default {
  fetchChartData
};
