import { CompanyProfile } from '../types';
import { makeApiRequest } from './utils';

/**
 * Fetches company profile information for a given symbol
 * 
 * @param symbol - Stock or company symbol
 * @returns Company profile data
 */
export async function fetchCompanyProfile(symbol: string): Promise<CompanyProfile> {
  try {
    const params = {
      symbol,
      modules: 'summaryProfile'
    };
    
    const data = await makeApiRequest<any>('quoteSummary', params);
    
    return data.summaryProfile;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
}

export default {
  fetchCompanyProfile
};
