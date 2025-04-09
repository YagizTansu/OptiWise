import { FundamentalsTimeSeriesDataPoint } from '../types';
import { makeApiRequest } from './utils';

/**
 * Fetches fundamental financial data as a time series
 * 
 * @param symbol - Stock symbol
 * @param period1 - Start date in YYYY-MM-DD format
 * @param module - Data module to fetch ('all' or specific module name)
 * @param type - Type of data ('annual', 'quarterly', etc.)
 * @returns Array of time series data points with financial metrics
 */
export async function fetchFundamentalsTimeSeries(
  symbol: string,
  period1: string = '2000-01-01',
  module: string = 'all',
  type: string = 'annual'
): Promise<FundamentalsTimeSeriesDataPoint[]> {
  try {
    const params = {
      symbol,
      period1,
      module,
      type
    };
    
    const data = await makeApiRequest<FundamentalsTimeSeriesDataPoint[]>('fundamentals-time-series', params);
    
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid fundamentals time series data received');
    }
    
    // Sort by date (newest first) if dates are present
    if (data.length > 0 && data[0].date) {
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching fundamentals time series:', error);
    throw error;
  }
}

export default {
  fetchFundamentalsTimeSeries
};
