import axios, { AxiosRequestConfig } from 'axios';

// Base API URL
export const API_BASE_URL = 'https://optiwise.onrender.com/api/finance';

/**
 * Common API request handler with error handling
 * 
 * @param endpoint - API endpoint to call
 * @param params - Optional query parameters
 * @returns Response data from the API
 */
export async function makeApiRequest<T>(endpoint: string, params?: any): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      params
    };
    
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, config);
    return response.data;
  } catch (error) {
    console.error(`Error making API request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Format date to localized string
 * 
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate date range from years back to today
 * 
 * @param years - Number of years to look back
 * @returns Object with start and end dates
 */
export function getDateRangeFromYears(years: number): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - years);
  return { startDate, endDate };
}

/**
 * Convert period string to date range
 * 
 * @param period - String representation of a time period (e.g., '1 Year', '5 Years')
 * @returns Object with start and end dates
 */
export function getDateRangeFromPeriod(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '1 Year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case '3 Years':
      startDate.setFullYear(endDate.getFullYear() - 3);
      break;
    case '5 Years':
      startDate.setFullYear(endDate.getFullYear() - 5);
      break;
    case '10 Years':
      startDate.setFullYear(endDate.getFullYear() - 10);
      break;
    case 'Max':
      startDate.setFullYear(2000); // Arbitrary start date for "Max"
      break;
    default:
      startDate.setFullYear(endDate.getFullYear() - 5);
  }
  
  return { startDate, endDate };
}

/**
 * Converts a period string to start and end dates
 * 
 * @param period - Time period string (e.g., '1d', '3mo', '1y')
 * @returns Object with ISO string dates for the period range
 */
export function getPeriodDateRange(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  let from: Date;
  
  switch (period) {
    case '1d':
      from = new Date(now.setDate(now.getDate() - 1));
      break;
    case '5d':
      from = new Date(now.setDate(now.getDate() - 5));
      break;
    case '1mo':
      from = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case '3mo':
      from = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case '6mo':
      from = new Date(now.setMonth(now.getMonth() - 6));
      break;
    case '1y':
      from = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case '2y':
      from = new Date(now.setFullYear(now.getFullYear() - 2));
      break;
    case '5y':
      from = new Date(now.setFullYear(now.getFullYear() - 5));
      break;
    case 'max':
      from = new Date(now.setFullYear(1900)); // Arbitrary distant past date
      break;
    default:
      from = new Date(now.setMonth(now.getMonth() - 3)); // Default to 3 months
  }
  
  return { from: from.toISOString(), to };
}

/**
 * Calculate standard deviation (volatility) of values
 * 
 * @param values - Array of numbers
 * @returns Standard deviation of the values
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}
