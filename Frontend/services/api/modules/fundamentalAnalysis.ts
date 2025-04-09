import { AnalysisData } from '../types';
import { makeApiRequest } from './utils';

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

export default {
  fetchAnalysisData
};
