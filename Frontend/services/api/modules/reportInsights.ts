import { InsightsData } from '../types';
import { makeApiRequest } from './utils';

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

export default {
  fetchInsightsData
};
