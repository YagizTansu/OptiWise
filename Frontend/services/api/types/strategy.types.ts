// Seasonal Strategy Insights types
export interface SeasonalPattern {
  period: string;
  return: number;
  consistency?: number;
}

export interface MonthlyStatistics {
  avgReturn: number;
  profitableAvgReturn?: number;
  consistency: number;
  years: number;
  positiveYears: number;
  maxReturn: number;
  minReturn: number;
  volatility: number;
}

export interface SeasonalStrategyResponse {
  strongestPattern: SeasonalPattern | null;
  riskPattern: SeasonalPattern | null;
  monthlyDetailedData: Record<string, MonthlyStatistics>;
  error: string | null;
  currency?: string;
}
