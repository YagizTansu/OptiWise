import { 
  DividendEvent, 
  DividendHistoryResponse, 
  DividendSummary 
} from '../types';
import { makeApiRequest, getDateRangeFromYears } from './utils';

/**
 * Fetches historical dividend data for a given symbol
 * 
 * @param symbol - Stock symbol
 * @param years - Number of years to look back (default: 5)
 * @returns Dividend events and chart data
 */
export async function fetchDividendHistory(
  symbol: string,
  years: number = 5
): Promise<DividendHistoryResponse> {
  try {
    // Calculate date range
    const { startDate, endDate } = getDateRangeFromYears(years);
    
    // Fetch historical dividend data
    const params = {
      symbol,
      period1: startDate.toISOString(),
      period2: endDate.toISOString(),
      interval: '1mo',
      events: 'div'
    };
    
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    // Process dividend events from chart data
    let dividendEvents: DividendEvent[] = [];
    
    if (data && 
        data.events && 
        data.events.dividends) {
      
      const rawDividends = data.events.dividends;
      
      // Process each dividend event
      dividendEvents = rawDividends.map((dividend: any) => {
        const timestamp = dividend.date || dividend.timestamp;
        const date = new Date(parseInt(timestamp) * 1000);
        const formattedDate = `${date.getMonth() + 1}/${date.getFullYear()}`;
        return {
          date: formattedDate,
          timestamp: parseInt(timestamp),
          amount: dividend.amount,
          fullDate: date
        };
      });
      
      // Sort dividends by timestamp (oldest first)
      dividendEvents.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      return {
        events: [],
        chartData: null,
        error: 'No dividend data available for this stock',
        currency: currency
      };
    }
    
    // Prepare chart data if we have dividend events
    let chartData = null;
    if (dividendEvents.length > 0) {
      chartData = {
        labels: dividendEvents.map(div => div.date),
        datasets: [
          {
            label: 'Dividend Amount',
            data: dividendEvents.map(div => div.amount),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true,
            tension: 0.2,
            pointRadius: dividendEvents.length > 20 ? 3 : 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#4CAF50',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2
          }
        ]
      };
    }
    
    return {
      events: dividendEvents,
      chartData,
      error: null,
      currency: currency
    };
  } catch (error) {
    console.error('Error fetching dividend history:', error);
    return {
      events: [],
      chartData: null,
      error: `Failed to load dividend data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      currency: 'USD' // Default currency if error
    };
  }
}

/**
 * Fetches dividend summary information for a stock
 * 
 * @param symbol - Stock symbol
 * @returns Dividend summary data
 */
export async function fetchDividendSummary(
  symbol: string
): Promise<DividendSummary | null> {
  try {
    const params = {
      symbol,
      modules: 'summaryDetail,defaultKeyStatistics'
    };
    
    const data = await makeApiRequest<any>('quoteSummary', params);
    
    // Extract dividend summary from quoteSummary response
    if (data && 
        data.quoteSummary && 
        data.quoteSummary.result && 
        data.quoteSummary.result[0]) {
      
      const details = data.quoteSummary.result[0];
      
      return {
        dividendRate: details.summaryDetail?.dividendRate?.raw,
        dividendYield: details.summaryDetail?.dividendYield?.raw,
        payoutRatio: details.summaryDetail?.payoutRatio?.raw,
        exDividendDate: details.summaryDetail?.exDividendDate?.fmt,
        fiveYearAvgDividendYield: details.defaultKeyStatistics?.fiveYearAvgDividendYield?.raw
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching dividend summary:', error);
    return null;
  }
}

export default {
  fetchDividendHistory,
  fetchDividendSummary
};
