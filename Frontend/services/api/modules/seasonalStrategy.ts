import {
  HistoricalDataPoint,
  SeasonalStrategyResponse,
  SeasonalPattern,
  MonthlyStatistics
} from '../types';
import { makeApiRequest, calculateStandardDeviation } from './utils';

/**
 * Fetches and analyzes seasonal strategy insights for a symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param years - Number of years of historical data to analyze (default: 5)
 * @returns Seasonal strategy insights including strongest and risk patterns
 */
export async function fetchSeasonalStrategyInsights(
  symbol: string,
  years: number = 5
): Promise<SeasonalStrategyResponse> {
  try {
    // Calculate date range based on years
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - years);
    
    // Format dates for API
    const period1 = startDate.toISOString();
    const period2 = endDate.toISOString();
    
    const params = {
      symbol,
      period1,
      period2,
      interval: '1d', // Changed to daily data for more accurate analysis
      includePrePost: true,
      events: 'div|split',
      lang: 'en-US',
      return: 'array',
      useYfid: true
    };
    
    // Fetch chart data
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    if (!data || !data.quotes || !data.quotes.length) {
      return {
        strongestPattern: null,
        riskPattern: null,
        monthlyDetailedData: {},
        error: 'No historical data available',
        currency: currency
      };
    }
    
    // Convert to expected HistoricalDataPoint format
    const historicalData = data.quotes.map((quote: any) => {
      const timestamp = quote.timestamp || quote.date;
      const date = typeof timestamp === 'number' 
        ? new Date(timestamp * 1000).toISOString() 
        : new Date(timestamp).toISOString();
        
      return {
        date,
        open: quote.open || 0,
        high: quote.high || 0,
        low: quote.low || 0,
        close: quote.close || 0,
        volume: quote.volume || 0,
        adjClose: quote.adjClose || quote.close || 0
      };
    });
    
    // Analyze seasonal patterns
    const result = analyzeSeasonalPatterns(historicalData);
    // Add currency to result
    result.currency = currency;
    
    return result;
    
  } catch (error) {
    console.error('Error fetching seasonal strategy insights:', error);
    return {
      strongestPattern: null,
      riskPattern: null,
      monthlyDetailedData: {},
      error: error instanceof Error ? error.message : 'Unknown error',
      currency: 'USD' // Default currency if error
    };
  }
}

/**
 * Analyzes historical data to detect seasonal patterns
 * 
 * @param historicalData - Array of historical data points
 * @returns Seasonal strategy insights
 */
function analyzeSeasonalPatterns(historicalData: HistoricalDataPoint[]): SeasonalStrategyResponse {
  // Group data by month
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Group historical data by year and month
  const dataByYearAndMonth: Record<number, Record<string, HistoricalDataPoint[]>> = {};
  
  historicalData.forEach(dataPoint => {
    const date = new Date(dataPoint.date);
    const year = date.getFullYear();
    const month = monthNames[date.getMonth()];
    
    if (!dataByYearAndMonth[year]) {
      dataByYearAndMonth[year] = {};
    }
    
    if (!dataByYearAndMonth[year][month]) {
      dataByYearAndMonth[year][month] = [];
    }
    
    dataByYearAndMonth[year][month].push(dataPoint);
  });
  
  // Calculate monthly returns for each year
  const monthlyReturns: Record<string, number[]> = {};
  monthNames.forEach(month => monthlyReturns[month] = []);
  
  Object.keys(dataByYearAndMonth).forEach(yearStr => {
    const year = parseInt(yearStr);
    
    monthNames.forEach(month => {
      const monthData = dataByYearAndMonth[year][month];
      
      if (monthData && monthData.length > 1) {
        // Calculate monthly return from first day to last day
        const firstDay = monthData[0];
        const lastDay = monthData[monthData.length - 1];
        
        const monthlyReturn = ((lastDay.close - firstDay.close) / firstDay.close) * 100;
        monthlyReturns[month].push(monthlyReturn);
      }
    });
  });
  
  // Calculate detailed monthly statistics for strategy exploration
  const monthlyDetailedData: Record<string, MonthlyStatistics> = {};
  
  monthNames.forEach(month => {
    const returns = monthlyReturns[month];
    if (returns.length > 0) {
      const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
      const positiveReturns = returns.filter(ret => ret > 0);
      const consistency = (positiveReturns.length / returns.length) * 100;
      
      // Calculate average return for profitable periods only
      const profitableAvgReturn = positiveReturns.length > 0 
        ? positiveReturns.reduce((sum, val) => sum + val, 0) / positiveReturns.length
        : 0;
      
      monthlyDetailedData[month] = {
        avgReturn: avgReturn,
        profitableAvgReturn: profitableAvgReturn, // New field: average return during profitable periods
        consistency, // This is the Win Rate %
        years: returns.length,
        positiveYears: positiveReturns.length,
        maxReturn: Math.max(...returns),
        minReturn: Math.min(...returns),
        volatility: calculateStandardDeviation(returns)
      };
    }
  });
  
  // Find best consecutive 3-4 month period
  const seasonalPatterns: {start: number; end: number; return: number; consistency: number}[] = [];
  
  for (let start = 0; start < 12; start++) {
    for (let length = 3; length <= 4; length++) {
      let totalReturn = 0;
      let totalConsistency = 0;
      let isValid = true;
      let periodCount = 0;
      
      for (let i = 0; i < length; i++) {
        const monthIndex = (start + i) % 12;
        const month = monthNames[monthIndex];
        
        if (!monthlyDetailedData[month]) {
          isValid = false;
          break;
        }
        
        totalReturn += monthlyDetailedData[month].avgReturn;
        totalConsistency += monthlyDetailedData[month].consistency;
        periodCount++;
      }
      
      if (isValid && periodCount > 0) {
        seasonalPatterns.push({
          start,
          end: (start + length - 1) % 12,
          return: totalReturn,
          consistency: totalConsistency / periodCount
        });
      }
    }
  }
  
  // Find strongest positive pattern
  let strongestPattern: SeasonalPattern | null = null;
  
  // Sort by score combining return and consistency
  const scoredPatterns = seasonalPatterns.map(pattern => ({
    ...pattern,
    score: pattern.return * 0.6 + (pattern.consistency / 100) * 0.4
  })).sort((a, b) => b.score - a.score);
  
  if (scoredPatterns.length > 0) {
    const best = scoredPatterns[0];
    strongestPattern = {
      period: `${monthNames[best.start]} to ${monthNames[best.end]}`,
      return: best.return,
      consistency: best.consistency
    };
  }
  
  // Find worst month (risk pattern)
  let riskPattern: SeasonalPattern | null = null;
  const monthRanked = Object.entries(monthlyDetailedData)
    .map(([month, data]) => ({ month, avgReturn: data.avgReturn, consistency: data.consistency }))
    .filter(m => monthlyReturns[m.month].length > 0)
    .sort((a, b) => a.avgReturn - b.avgReturn);
    
  if (monthRanked.length > 0) {
    const worst = monthRanked[0];
    riskPattern = {
      period: worst.month,
      return: worst.avgReturn,
      consistency: worst.consistency
    };
  }
  
  return {
    strongestPattern,
    riskPattern,
    monthlyDetailedData,
    error: null
  };
}

export default {
  fetchSeasonalStrategyInsights
};
