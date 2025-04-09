// Fundamentals Time Series types
export interface FundamentalsTimeSeriesDataPoint {
  date: string;
  [key: string]: any; // For all possible financial metrics
}
