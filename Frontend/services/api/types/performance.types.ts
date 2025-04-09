// Performance metrics types
export interface PeriodData {
  label: string;
  value: number;
  months: number;
  currency?: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface AnnualReturnData {
  labels: string[];
  returns: number[];
  statistics: {
    bestYear: string;
    worstYear: string;
    average: string;
  };
  currency?: string;
}

// Statistics types
export interface StatisticsData {
  allTimeHigh: number | string;
  allTimeLow: number | string;
  profitDays: string;
  avgHoldPeriod: string;
  currency?: string;
}

// Time Average Returns types
export interface TimeAverageReturnData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
  }>;
}

export interface ReturnStatisticData {
  period: string;
  avgReturn: number;
  stdDev: number;
  winRate: number;
  best: number;
  worst: number;
}

export interface TimeAverageReturnResponse {
  chartData: TimeAverageReturnData;
  statistics: ReturnStatisticData[];
  currency?: string;
}
