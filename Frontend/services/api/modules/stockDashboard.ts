import { QuoteSummaryData } from '../types';
import { makeApiRequest } from './utils';

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

export default {
  fetchStockDashboardData
};
