import { PatternCorrelationData } from '../types';
import { makeApiRequest } from './utils';

/**
 * Fetches and calculates pattern correlation between two time periods
 * 
 * @param symbol - Stock or asset symbol
 * @param firstPeriod - First time period in years (e.g., '3 Years')
 * @param secondPeriod - Second time period in years (e.g., '5 Years') 
 * @returns Correlation data including coefficient, strength, and chart data
 */
export async function fetchPatternCorrelation(
  symbol: string,
  firstPeriod: string,
  secondPeriod: string
): Promise<PatternCorrelationData> {
  try {
    const currentDate = new Date();
    
    // Calculate date ranges based on selected periods
    const firstPeriodMs = periodToMs(firstPeriod);
    const secondPeriodMs = periodToMs(secondPeriod);
    
    // First period
    const firstPeriodStart = new Date(currentDate.getTime() - firstPeriodMs);
    const firstPeriodEnd = new Date(currentDate);
    
    // Second period
    const secondPeriodStart = new Date(currentDate.getTime() - secondPeriodMs);
    const secondPeriodEnd = new Date(currentDate);
    
    // Make API calls to get chart data
    const [firstPeriodResponse, secondPeriodResponse] = await Promise.all([
      makeApiRequest<any>('chart', {
        symbol,
        period1: firstPeriodStart.toISOString(),
        period2: firstPeriodEnd.toISOString(),
        interval: '1d',
        includePrePost: true,
        events: 'div|split',
        lang: 'en-US',
        return: 'array',
        useYfid: true
      }),
      makeApiRequest<any>('chart', {
        symbol,
        period1: secondPeriodStart.toISOString(),
        period2: secondPeriodEnd.toISOString(),
        interval: '1d',
        includePrePost: true,
        events: 'div|split',
        lang: 'en-US',
        return: 'array',
        useYfid: true
      })
    ]);
    
    // Extract currency (use the first response's currency)
    const currency = firstPeriodResponse?.meta?.currency || secondPeriodResponse?.meta?.currency || 'USD';
    
    // Extract closing prices for correlation calculation
    const firstPeriodData = firstPeriodResponse?.quotes || [];
    const secondPeriodData = secondPeriodResponse?.quotes || [];
    
    const firstPeriodPrices = firstPeriodData.map((item: any) => item.close);
    const secondPeriodPrices = secondPeriodData.map((item: any) => item.close);
    
    // Calculate correlation coefficient
    const coefficient = calculateCorrelation(firstPeriodPrices, secondPeriodPrices);
    const correlationPercentage = Math.abs(coefficient) * 100;
    
    // Determine strength and reliability
    const strength = getCorrelationStrength(coefficient);
    const reliabilityScore = calculateReliabilityScore(
      coefficient, 
      Math.min(firstPeriodPrices.length, secondPeriodPrices.length)
    );
    
    // Get the correlation color for visual feedback
    const correlationColor = getCorrelationColor(coefficient);
    
    return {
      coefficient: parseFloat(coefficient.toFixed(2)),
      strength,
      reliabilityScore,
      chartData: {
        labels: ['Correlation', 'No Correlation'],
        datasets: [
          {
            data: [correlationPercentage, 100 - correlationPercentage],
            backgroundColor: [
              correlationColor,
              'rgba(230, 230, 230, 0.5)'
            ],
            borderWidth: 0,
            cutout: '75%'
          }
        ]
      },
      currency: currency
    };
  } catch (error) {
    console.error('Error fetching pattern correlation data:', error);
    throw error;
  }
}

/**
 * Helper function to convert period strings to milliseconds
 */
function periodToMs(period: string): number {
  if (period === "Current Year") {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of current year
    return now.getTime() - startOfYear.getTime();
  }
  
  const value = parseInt(period);
  if (period.includes('Year')) {
    return value * 365 * 24 * 60 * 60 * 1000;
  }
  return 365 * 24 * 60 * 60 * 1000; // default to 1 year
}

/**
 * Calculate correlation between two datasets
 */
function calculateCorrelation(dataset1: number[], dataset2: number[]): number {
  if (dataset1.length === 0 || dataset2.length === 0) return 0;
  
  // Ensure datasets are the same length by using the smaller one
  const length = Math.min(dataset1.length, dataset2.length);
  dataset1 = dataset1.slice(0, length);
  dataset2 = dataset2.slice(0, length);
  
  // Calculate mean
  const mean1 = dataset1.reduce((sum, val) => sum + val, 0) / length;
  const mean2 = dataset2.reduce((sum, val) => sum + val, 0) / length;
  
  // Calculate correlation coefficient
  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;
  
  for (let i = 0; i < length; i++) {
    const diff1 = dataset1[i] - mean1;
    const diff2 = dataset2[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }
  
  if (denominator1 === 0 || denominator2 === 0) return 0;
  
  return numerator / Math.sqrt(denominator1 * denominator2);
}

/**
 * Determine correlation strength as text
 */
function getCorrelationStrength(coefficient: number): string {
  const absCoefficient = Math.abs(coefficient);
  if (absCoefficient > 0.7) return 'Strong';
  if (absCoefficient > 0.5) return 'Moderate';
  if (absCoefficient > 0.3) return 'Weak';
  return 'Very Weak';
}

/**
 * Get color based on correlation value
 */
function getCorrelationColor(coefficient: number): string {
  const absValue = Math.abs(coefficient);
  if (absValue > 0.7) return '#20a0b8';  // Strong - teal
  if (absValue > 0.5) return '#5e88fc';  // Moderate - blue
  if (absValue > 0.3) return '#ba68c8';  // Weak - purple
  return '#9e9e9e';  // Very Weak - gray
}

/**
 * Calculate reliability score based on data size and correlation strength
 */
function calculateReliabilityScore(coefficient: number, dataSize: number): number {
  const baseScore = Math.abs(coefficient) * 100;
  // Adjust based on data size (more data = more reliable)
  const dataSizeFactor = Math.min(1, dataSize / 250); // 250 days (~1 trading year) is considered full reliability
  return Math.round(baseScore * (0.7 + 0.3 * dataSizeFactor));
}

export default {
  fetchPatternCorrelation
};
