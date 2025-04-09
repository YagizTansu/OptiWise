import { SearchResult } from '../types';
import { makeApiRequest } from './utils';

/**
 * Searches for stocks, ETFs and other financial instruments by name or ticker
 * 
 * @param query - Search term
 * @param limit - Maximum number of results to return
 * @returns Array of search results
 */
export async function searchSymbols(
  query: string,
  limit: number = 100
): Promise<SearchResult[]> {
  try {
    if (!query.trim()) {
      return [];
    }
    
    const params = {
      query,
      limit: limit.toString()
    };
    
    const data = await makeApiRequest<any[]>('search', params);

    if (data && Array.isArray(data) && data.length > 0) {
      return data.map(quote => ({
        symbol: quote.symbol,
        shortName: quote.longname || quote.shortname ||'',
        exchange: quote.exchDisp || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}

export default {
  searchSymbols
};
