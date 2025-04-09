// Seasonality types
export interface SeasonalityDataPoint {
  period: string;
  avgChange: number;
}

export interface SeasonalityDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor: string;
}

export interface SeasonalityChartData {
  currency: any;
  labels: string[];
  datasets: SeasonalityDataset[];
}

export interface SeasonalityResponse {
  daily?: SeasonalityChartData;
  weekly?: SeasonalityChartData;
  monthly?: SeasonalityChartData;
  yearly?: SeasonalityChartData;
  error?: string;
  currency?: string;
}
