// Import all types from the types directory
import {
  ChartDataPoint,
  ChartDataResponse,
  QuoteData,
  PriceVolumeData,
  PeriodData,
  HistoricalDataPoint,
  AnnualReturnData,
  StatisticsData,
  TimeAverageReturnData,
  ReturnStatisticData,
  TimeAverageReturnResponse,
  DividendEvent,
  DividendSummary,
  DividendChartData,
  DividendHistoryResponse,
  SeasonalityDataPoint,
  SeasonalityDataset,
  SeasonalityChartData,
  SeasonalityResponse,
  SeasonalPattern,
  MonthlyStatistics,
  SeasonalStrategyResponse,
  PatternCorrelationData,
  InsightsData,
  WyckoffIndicatorData,
  AnalysisData,
  QuoteSummaryData,
  CompanyProfile,
  SearchResult,
  InsiderHolder,
  InsiderTransaction,
  InstitutionalOwner,
  InsiderOwnershipData,
  FundamentalsTimeSeriesDataPoint
} from './types';

// Import modular functions
import chartDataModule from './modules/chartData';
import quoteDataModule from './modules/quoteData';
import performanceMetricsModule from './modules/performanceMetrics';
import dividendsModule from './modules/dividends';
import timeAverageReturnsModule from './modules/timeAverageReturns';
import seasonalityModule from './modules/seasonality';
import seasonalStrategyModule from './modules/seasonalStrategy';
import patternCorrelationModule from './modules/patternCorrelation';
import reportInsightsModule from './modules/reportInsights';
import wyckoffIndicatorModule from './modules/wyckoffIndicator';
import priceVolumeChartModule from './modules/priceVolumeChart';
import fundamentalAnalysisModule from './modules/fundamentalAnalysis';
import stockDashboardModule from './modules/stockDashboard';
import companyProfileModule from './modules/companyProfile';
import searchModule from './modules/search';
import insiderOwnershipModule from './modules/insiderOwnership';
import fundamentalsTimeSeriesModule from './modules/fundamentalsTimeSeries';

const { fetchChartData } = chartDataModule;
const { fetchQuoteData } = quoteDataModule;
const { fetchPerformanceMetrics, fetchAnnualPerformance, fetchKeyStatistics } = performanceMetricsModule;
const {fetchDividendHistory,fetchDividendSummary} = dividendsModule;
const { fetchTimeAverageReturns } = timeAverageReturnsModule;
const {fetchSeasonalityData,fetchAllSeasonalityData} = seasonalityModule;
const { fetchSeasonalStrategyInsights } = seasonalStrategyModule;
const { fetchPatternCorrelation } = patternCorrelationModule;
const { fetchInsightsData } = reportInsightsModule;
const { fetchWyckoffIndicatorData } = wyckoffIndicatorModule;
const { fetchPriceVolumeData } = priceVolumeChartModule;
const { fetchAnalysisData } = fundamentalAnalysisModule;
const { fetchStockDashboardData } = stockDashboardModule;
const { fetchCompanyProfile } = companyProfileModule;
const { searchSymbols } = searchModule;
const { fetchInsiderAndInstitutionalData } = insiderOwnershipModule;
const { fetchFundamentalsTimeSeries } = fundamentalsTimeSeriesModule;

export type {
  ChartDataPoint,
  ChartDataResponse,
  QuoteData,
  PriceVolumeData,
  PeriodData,
  HistoricalDataPoint,
  AnnualReturnData,
  StatisticsData,
  TimeAverageReturnData,
  ReturnStatisticData,
  TimeAverageReturnResponse,
  DividendEvent,
  DividendSummary,
  DividendChartData,
  DividendHistoryResponse,
  SeasonalityDataPoint,
  SeasonalityDataset,
  SeasonalityChartData,
  SeasonalityResponse,  
  SeasonalPattern,
  MonthlyStatistics,  
  SeasonalStrategyResponse,  
  PatternCorrelationData, 
  InsightsData,
  WyckoffIndicatorData,
  AnalysisData,
  QuoteSummaryData,
  CompanyProfile,
  SearchResult,
  InsiderHolder,
  InsiderTransaction,
  InstitutionalOwner,
  InsiderOwnershipData,
  FundamentalsTimeSeriesDataPoint
};

// Base API URL
const API_BASE_URL = 'http://localhost:3001/api/finance';

// =============================================================================
// CHART DATA FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchChartData };

// =============================================================================
// QUOTE DATA FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchQuoteData };

// =============================================================================
// PERFORMANCE METRICS FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchPerformanceMetrics, fetchAnnualPerformance, fetchKeyStatistics };

// =============================================================================
// DIVIDEND FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchDividendHistory, fetchDividendSummary };

// =============================================================================
// TIME AVERAGE RETURNS FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchTimeAverageReturns };

// =============================================================================
// SEASONALITY FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchSeasonalityData, fetchAllSeasonalityData };

// =============================================================================
// SEASONAL STRATEGY INSIGHTS FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchSeasonalStrategyInsights };

// =============================================================================
// PATTERN CORRELATION FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchPatternCorrelation };

// =============================================================================
// REPORT INSIGHTS FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchInsightsData };

// =============================================================================
// WYCKOFF INDICATOR FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchWyckoffIndicatorData };

// =============================================================================
// PRICE VOLUME CHART FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchPriceVolumeData };

// =============================================================================
// FUNDAMENTAL ANALYSIS FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchAnalysisData };

// =============================================================================
// STOCK DASHBOARD FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchStockDashboardData };

// =============================================================================
// COMPANY PROFILE FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchCompanyProfile };

// =============================================================================
// SEARCH FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { searchSymbols };

// =============================================================================
// INSIDER AND INSTITUTIONAL OWNERSHIP FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchInsiderAndInstitutionalData };

// =============================================================================
// FUNDAMENTALS TIME SERIES FUNCTIONS
// =============================================================================

// Re-export the imported functions
export { fetchFundamentalsTimeSeries };