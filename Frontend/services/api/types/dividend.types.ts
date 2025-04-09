// Dividend types
export interface DividendEvent {
  date: string;
  timestamp: number;
  amount: number;
  fullDate: Date;
}

export interface DividendSummary {
  dividendRate?: number;
  dividendYield?: number;
  payoutRatio?: number;
  exDividendDate?: string;
  fiveYearAvgDividendYield?: number;
}

export interface DividendChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    pointRadius: number;
    pointHoverRadius: number;
    pointHoverBackgroundColor: string;
    pointHoverBorderColor: string;
    pointHoverBorderWidth: number;
  }>;
}

export interface DividendHistoryResponse {
  events: DividendEvent[];
  chartData: DividendChartData | null;
  error: string | null;
  currency?: string;
}
