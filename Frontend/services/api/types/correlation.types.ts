// Pattern Correlation types
export interface PatternCorrelationData {
  coefficient: number;
  strength: string;
  reliabilityScore: number;
  chartData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
      cutout: string;
    }>;
  };
  currency?: string;
}
