import { WyckoffIndicatorData } from '../types';
import { makeApiRequest } from './utils';

/**
 * Converts a timeframe string to a date range with appropriate interval
 * 
 * @param timeframe - String representation of the timeframe (e.g., '1y', '6m', '1w')
 * @returns Object with from date, to date, and appropriate interval
 */
function timeframeToDateRange(timeframe: string): { from: string; to: string; interval: string } {
  const now = new Date();
  const endDate = now.toISOString();
  let startDate;
  let interval = '1d';
  
  switch (timeframe) {
    case '1w':
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      interval = '60m';
      break;
    case '3d':
      startDate = new Date(now.setDate(now.getDate() - 3)).toISOString();
      interval = '30m';
      break;
    case 'd':
      startDate = new Date(now.setDate(now.getDate() - 1)).toISOString();
      interval = '5m';
      break;
    case 'w':
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      interval = '60m';
      break;
    case '1m':
      startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      interval = '1d';
      break;
    case '6m':
      startDate = new Date(now.setMonth(now.getMonth() - 6)).toISOString();
      interval = '1d';
      break;
    case '1y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      interval = '1d';
      break;
    case '3y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 3)).toISOString();
      interval = '1wk';
      break;
    case '5y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 5)).toISOString();
      interval = '1wk';
      break;
    default:
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      interval = '1d';
  }
  
  return { from: startDate, to: endDate, interval };
}

/**
 * Calculate the Wyckoff Causes/Effects indicator based on price and volume data
 * This combines momentum and supply/demand factors to create an oscillating indicator
 * 
 * @param timestamps - Array of timestamps
 * @param quotes - Object containing price and volume data arrays
 * @returns Processed Wyckoff indicator data
 */
function calculateWyckoffIndicator(timestamps: any[], quotes: any): WyckoffIndicatorData {
  if (!timestamps.length || !quotes.close || !quotes.volume || quotes.close.length < 14) {
    return { labels: [], indicators: [] };
  }
  
  const closes = quotes.close;
  const volumes = quotes.volume;
  const highs = quotes.high;
  const lows = quotes.low;
  
  const labels: string[] = [];
  const indicators: number[] = [];
  
  const lookback = 14; // Minimum 14 periyot
  
  for (let i = lookback; i < closes.length; i++) {
    const date = typeof timestamps[i] === 'number' 
      ? new Date(timestamps[i] * 1000) 
      : new Date(timestamps[i]);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // **1. Momentum Hesaplama (Log Ölçekleme ile)**
    const priceChange = Math.log(closes[i] / closes[i - lookback]);

    // **2. Hacim Trendini Hesapla**
    let volumeSum = 0, prevVolumeSum = 0;
    for (let j = 0; j < lookback; j++) {
      volumeSum += volumes[i - j] || 0;
      prevVolumeSum += volumes[i - j - lookback] || 0;
    }
    const volumeTrend = prevVolumeSum > 0 ? Math.log(volumeSum / prevVolumeSum) : 0;

    // **3. Volatilite (True Range) Hesaplama**
    let trueRange = 0;
    for (let j = 0; j < lookback; j++) {
      const prevClose = closes[i - j - 1] || closes[i - j];
      const currentTR = Math.max(
        (highs[i - j] || prevClose) - (lows[i - j] || prevClose),
        Math.abs((highs[i - j] || prevClose) - prevClose),
        Math.abs((lows[i - j] || prevClose) - prevClose)
      );
      trueRange += currentTR;
    }
    trueRange /= lookback;
    const normalizedTrueRange = trueRange / closes[i] * 100;

    // **4. Wyckoff Göstergesi Hesaplama (Daha Dengeli Ağırlıklandırma)**
    const wyckoffIndicator = (priceChange * 12) * (1 + volumeTrend * 0.4) * (1 - normalizedTrueRange * 0.03);

    // **5. Normalize ve Sınırlandır**
    const scaledIndicator = Math.max(Math.min(wyckoffIndicator * 100, 15), -15);

    indicators.push(scaledIndicator);
  }
  
  return { labels, indicators };
}


/**
 * Fetches chart data and calculates Wyckoff indicator values
 * 
 * @param symbol - Stock or asset symbol
 * @param timeframe - Time period to analyze (e.g., '1y', '6m', '1w')
 * @returns Processed Wyckoff indicator data
 */
export async function fetchWyckoffIndicatorData(symbol: string, timeframe: string): Promise<WyckoffIndicatorData> {
  try {
    // Convert timeframe to date range parameters
    const period = timeframeToDateRange(timeframe);

    // Fetch the chart data
    const params = {
      symbol,
      period1: period.from,
      period2: period.to,
      interval: period.interval,
      includePrePost: true,
      events: 'div|split|earn'
    };
    
    const data = await makeApiRequest<any>('chart', params);
    
    // Extract currency information
    const currency = data?.meta?.currency || 'USD';
    
    // Extract data from response
    if (data && data.quotes && data.quotes.length > 0) {
      // Extract quotes array
      const quotes = data.quotes;
      
      // Extract necessary data points for Wyckoff calculation
      const timestamps = quotes.map((q: any) => q.date || q.timestamp);
      const closes = quotes.map((q: any) => q.close || q.adjclose);
      const volumes = quotes.map((q: any) => q.volume);
      const highs = quotes.map((q: any) => q.high);
      const lows = quotes.map((q: any) => q.low);
      
      // Create consolidated data structure for the calculation
      const quoteData = {
        close: closes,
        volume: volumes,
        high: highs,
        low: lows
      };
      
      // Process data for Wyckoff indicator
      const wyckoffData = calculateWyckoffIndicator(timestamps, quoteData);
      // Add currency to result
      wyckoffData.currency = currency;
      
      return wyckoffData;
    } else {
      throw new Error('Invalid data format received from API');
    }
  } catch (error) {
    console.error('Failed to load Wyckoff indicator data:', error);
    throw error;
  }
}

export default {
  fetchWyckoffIndicatorData
};
