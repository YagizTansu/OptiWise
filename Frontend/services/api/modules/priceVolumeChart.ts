import { PriceVolumeData } from '../types';
import { makeApiRequest, formatDate, getPeriodDateRange } from './utils';

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

export default {
  fetchPriceVolumeData
};
