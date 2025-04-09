import { 
  InsiderOwnershipData, 
  InsiderHolder, 
  InsiderTransaction, 
  InstitutionalOwner 
} from '../types';
import { makeApiRequest } from './utils';

/**
 * Fetches insider and institutional ownership data for a given symbol
 * 
 * @param symbol - Stock symbol
 * @returns Insider holders, transactions, and institutional ownership data
 */
export async function fetchInsiderAndInstitutionalData(
  symbol: string
): Promise<InsiderOwnershipData> {
  try {
    const params = {
      symbol,
      modules: 'insiderHolders,insiderTransactions,institutionOwnership'
    };
    
    const data = await makeApiRequest<any>('quoteSummary', params);
    
    // Extract currency information (default to USD if not available)
    const currency = data?.price?.currency || 'USD';
    
    // Process insider holders data
    const insiderHolders: InsiderHolder[] = [];
    if (data?.insiderHolders?.holders) {
      data.insiderHolders.holders.forEach((holder: any) => {
        insiderHolders.push({
          maxAge: holder.maxAge || 0,
          name: holder.name || '',
          relation: holder.relation || '',
          url: holder.url || '',
          transactionDescription: holder.transactionDescription || '',
          latestTransDate: new Date(holder.latestTransDate?.raw ? holder.latestTransDate.raw * 1000 : 0), 
          positionDirect: holder.positionDirect?.raw || 0,
          positionDirectDate: new Date(holder.positionDirectDate?.raw ? holder.positionDirectDate.raw * 1000 : 0)
        });
      });
    }
    
    // Process insider transactions data
    const insiderTransactions: InsiderTransaction[] = [];
    if (data?.insiderTransactions?.transactions) {
      data.insiderTransactions.transactions.forEach((transaction: any) => {
        insiderTransactions.push({
          maxAge: transaction.maxAge || 0,
          shares: transaction.shares?.raw || 0,
          value: transaction.value?.raw || 0,
          filerUrl: transaction.filerUrl || '',
          transactionText: transaction.transactionText || '',
          filerName: transaction.filerName || '',
          filerRelation: transaction.filerRelation || '',
          moneyText: transaction.moneyText || '',
          startDate: new Date(transaction.startDate?.raw ? transaction.startDate.raw * 1000 : 0),
          ownership: transaction.ownership || ''
        });
      });
    }
    
    // Process institutional owners data
    const institutionalOwners: InstitutionalOwner[] = [];
    if (data?.institutionOwnership?.ownershipList) {
      
      data.institutionOwnership.ownershipList.forEach((owner: any) => {
        const reportDate = owner.reportDate?.raw 
          ? new Date(owner.reportDate.raw * 1000) 
          : new Date(owner.reportDate || 0);

        institutionalOwners.push({
          maxAge: owner.maxAge || 0,
          reportDate: reportDate,
          organization: owner.organization || '',
          pctHeld: owner.pctHeld || 0,
          position: owner.position || 0,
          value: owner.value?.raw || 0
        });
      });
    }
    
    return {
      insiderHolders,
      insiderTransactions,
      institutionalOwners,
      error: null,
      currency
    };
  } catch (error) {
    console.error('Error fetching insider and institutional ownership data:', error);
    return {
      insiderHolders: [],
      insiderTransactions: [],
      institutionalOwners: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      currency: 'USD' // Default currency if error
    };
  }
}

export default {
  fetchInsiderAndInstitutionalData
};
