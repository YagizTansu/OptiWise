import { QuoteData, QuoteSummaryData } from '../types';
import { makeApiRequest } from './utils';

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


export default {
  fetchQuoteData,
};
