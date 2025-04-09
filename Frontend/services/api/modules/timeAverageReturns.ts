import { 
  HistoricalDataPoint, 
  TimeAverageReturnData, 
  ReturnStatisticData,
  TimeAverageReturnResponse 
} from '../types';
import { makeApiRequest, getDateRangeFromPeriod } from './utils';

/**
 * Fetches and processes time average returns data for a symbol
 * 
 * @param symbol - Stock or asset symbol
 * @param period - Time period to analyze (e.g., '1 Year', '5 Years')
 * @param viewType - Type of view ('daily', 'monthly', 'yearly')
 * @returns Processed chart data and statistics
 */
export async function fetchTimeAverageReturns(
  symbol: string,
  period: string,
  viewType: string
): Promise<TimeAverageReturnResponse> {
  try {
    // Calculate date range based on selected period
    const { startDate, endDate } = getDateRangeFromPeriod(period);
    
    // Determine appropriate interval based on view type
    const interval = viewType === 'daily' ? '1d' : '1mo';
    
    // Format dates for API
    const period1 = startDate.toISOString();
    const period2 = endDate.toISOString();
    
    const params = {
      symbol,
      period1,
      period2,
      interval,
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
      throw new Error('No data available for the selected criteria');
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
    
    // Process data based on view type
    let processedChartData;
    switch (viewType) {
      case 'daily':
        processedChartData = processDailyData(historicalData, period);
        break;
      case 'monthly':
        processedChartData = processMonthlyData(historicalData, period);
        break;
      case 'yearly':
        processedChartData = processYearlyData(historicalData, period);
        break;
      default:
        processedChartData = processMonthlyData(historicalData, period);
    }
    
    // Calculate statistics
    const statistics = calculateTimeAverageStats(historicalData, viewType);
    
    return {
      chartData: processedChartData,
      statistics,
      currency: currency
    };
  } catch (error) {
    console.error('Error fetching time average returns:', error);
    throw error;
  }
}

/**
 * Process data for daily view (day of month)
 */
function processDailyData(data: HistoricalDataPoint[], period: string): TimeAverageReturnData {
  // Group returns by day of month
  const dailyReturns: { [day: number]: number[] } = {};
  
  // Initialize all days
  for (let i = 1; i <= 31; i++) {
    dailyReturns[i] = [];
  }
  
  // Calculate daily returns and group by day of month
  for (let i = 1; i < data.length; i++) {
    const previousClose = data[i-1].close;
    const currentClose = data[i].close;
    const returnPct = ((currentClose - previousClose) / previousClose) * 100;
    
    const date = new Date(data[i].date);
    const dayOfMonth = date.getDate();
    
    dailyReturns[dayOfMonth].push(returnPct);
  }
  
  // Calculate average return for each day of month
  const labels = Array.from({length: 31}, (_, i) => (i + 1).toString());
  const averageReturns = labels.map((day) => {
    const dayNum = parseInt(day);
    const returns = dailyReturns[dayNum];
    return returns.length > 0 
      ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
      : 0;
  });
  
  return {
    labels,
    datasets: [
      {
        label: `${period} Average Returns`,
        data: averageReturns,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      }
    ]
  };
}

/**
 * Process data for monthly view
 */
function processMonthlyData(data: HistoricalDataPoint[], period: string): TimeAverageReturnData {
  // Group returns by month
  const monthlyReturns: { [month: number]: number[] } = {};
  
  // Initialize all months
  for (let i = 0; i < 12; i++) {
    monthlyReturns[i] = [];
  }
  
  // Calculate monthly returns
  for (let i = 1; i < data.length; i++) {
    const previousClose = data[i-1].close;
    const currentClose = data[i].close;
    const returnPct = ((currentClose - previousClose) / previousClose) * 100;
    
    const date = new Date(data[i].date);
    const month = date.getMonth();
    
    monthlyReturns[month].push(returnPct);
  }
  
  // Calculate average return for each month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const averageReturns = monthNames.map((_, idx) => {
    const returns = monthlyReturns[idx];
    return returns.length > 0 
      ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
      : 0;
  });
  
  return {
    labels: monthNames,
    datasets: [
      {
        label: `${period} Average Returns`,
        data: averageReturns,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      }
    ]
  };
}

/**
 * Process data for yearly view
 */
function processYearlyData(data: HistoricalDataPoint[], period: string): TimeAverageReturnData {
  // Group returns by year
  const yearlyReturns: { [year: number]: number[] } = {};
  
  // Calculate yearly returns
  for (let i = 1; i < data.length; i++) {
    const previousClose = data[i-1].close;
    const currentClose = data[i].close;
    const returnPct = ((currentClose - previousClose) / previousClose) * 100;
    
    const date = new Date(data[i].date);
    const year = date.getFullYear();
    
    if (!yearlyReturns[year]) {
      yearlyReturns[year] = [];
    }
    
    yearlyReturns[year].push(returnPct);
  }
  
  // Extract unique years and sort them
  const years = Object.keys(yearlyReturns).map(Number).sort();
  
  // Calculate average return for each year
  const averageReturns = years.map(year => {
    const returns = yearlyReturns[year];
    return returns.length > 0 
      ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
      : 0;
  });
  
  return {
    labels: years.map(String),
    datasets: [
      {
        label: `${period} Average Returns`,
        data: averageReturns,
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      }
    ]
  };
}

/**
 * Calculate statistics for time average returns
 */
function calculateTimeAverageStats(data: HistoricalDataPoint[], viewType: string): ReturnStatisticData[] {
  const getPeriodName = (idx: number, type: string) => {
    if (type === 'monthly') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      return monthNames[idx];
    } else if (type === 'daily') {
      return `Day ${idx + 1}`;
    } else {
      // Extract actual years from data for yearly view
      const yearsSet = new Set(data.map(point => new Date(point.date).getFullYear()));
      const years = Array.from(yearsSet).sort();
      return years[idx] ? years[idx].toString() : `Year ${idx + 1}`;
    }
  };

  // Determine number of periods based on view type
  const periodCount = viewType === 'monthly' ? 12 : (viewType === 'daily' ? 31 : 10);
  
  // Group data by respective periods
  const periodReturns: { [period: number]: number[] } = {};
  
  // Initialize all periods
  for (let i = 0; i < periodCount; i++) {
    periodReturns[i] = [];
  }
  
  // Calculate returns and group by period
  for (let i = 1; i < data.length; i++) {
    const previousClose = data[i-1].close;
    const currentClose = data[i].close;
    const returnPct = ((currentClose - previousClose) / previousClose) * 100;
    
    const date = new Date(data[i].date);
    let periodIndex: number;
    
    if (viewType === 'monthly') {
      periodIndex = date.getMonth();
    } else if (viewType === 'daily') {
      periodIndex = date.getDate() - 1;
      if (periodIndex >= periodCount) continue; // Skip days beyond 31
    } else { // yearly
      // Get unique years and map to index
      const yearsSet = new Set(data.map(point => new Date(point.date).getFullYear()));
      const years = Array.from(yearsSet).sort();
      periodIndex = years.indexOf(date.getFullYear());
      if (periodIndex === -1 || periodIndex >= periodCount) continue;
    }
    
    periodReturns[periodIndex].push(returnPct);
  }
  
  // Calculate statistics for each period
  return Object.keys(periodReturns)
    .map(Number)
    .filter(idx => idx < periodCount)
    .map(idx => {
      const returns = periodReturns[idx];
      
      if (returns.length === 0) {
        return {
          period: getPeriodName(idx, viewType),
          avgReturn: 0,
          stdDev: 0,
          winRate: 0,
          best: 0,
          worst: 0
        };
      }
      
      // Calculate average return
      const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
      
      // Calculate standard deviation
      const variance = returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate win rate
      const winningReturns = returns.filter(ret => ret > 0).length;
      const winRate = (winningReturns / returns.length) * 100;
      
      // Get best and worst returns
      const best = Math.max(...returns);
      const worst = Math.min(...returns);
      
      return {
        period: getPeriodName(idx, viewType),
        avgReturn,
        stdDev,
        winRate,
        best,
        worst
      };
    });
}

export default {
  fetchTimeAverageReturns
};
