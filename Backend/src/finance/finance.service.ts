import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import yahooFinance from 'yahoo-finance2';

// Interface for Yahoo Finance search options
interface SearchOptions {
  quotesCount?: number;
  newsCount?: number;
  enableFuzzyQuery?: boolean;
  lang?: string;
  region?: string;
  quotesQueryId?: string;
  multiQuoteQueryId?: string;
  newsQueryId?: string;
  enableCb?: boolean;
  enableNavLinks?: boolean;
  enableEnhancedTrivialQuery?: boolean;
}

// Interface for Yahoo Finance chart options
interface ChartOptions {
  period1: Date | string | number;
  period2?: Date | string | number;
  useYfid?: boolean;
  interval?: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo';
  includePrePost?: boolean;
  events?: string;
  lang?: string;
  return?: 'array' | 'object';
}

// Allow any quote field from Yahoo Finance API
type QuoteField = string;

// Interface for Yahoo Finance quote options
interface QuoteOptions {
  fields?: QuoteField[];
  return?: 'array' | 'map' | 'object';
}

// Define the valid quoteSummary module names as a union type
// Note: Removed "symbol" which is causing the type error
type QuoteSummaryModule = 
  | 'assetProfile' | 'balanceSheetHistory' | 'balanceSheetHistoryQuarterly'
  | 'calendarEvents' | 'cashflowStatementHistory' | 'cashflowStatementHistoryQuarterly'
  | 'defaultKeyStatistics' | 'earnings' | 'earningsHistory' | 'earningsTrend'
  | 'financialData' | 'fundOwnership' | 'fundPerformance' | 'fundProfile'
  | 'incomeStatementHistory' | 'incomeStatementHistoryQuarterly' | 'indexTrend'
  | 'industryTrend' | 'insiderHolders' | 'insiderTransactions' | 'institutionOwnership'
  | 'majorDirectHolders' | 'majorHoldersBreakdown' | 'netSharePurchaseActivity'
  | 'price' | 'quoteType' | 'recommendationTrend' | 'secFilings' | 'sectorTrend'
  | 'summaryDetail' | 'summaryProfile' | 'topHoldings' | 'upgradeDowngradeHistory';

// Interface for Yahoo Finance quoteSummary options with proper typing
interface QuoteSummaryOptions {
  modules?: QuoteSummaryModule[] | 'all';
  formatted?: boolean;
}

/**
 * Historical interval options are more limited than chart intervals
 */
type HistoricalInterval = '1d' | '1wk' | '1mo';

// Interface for trending symbols query options
interface TrendingQueryOptions {
  count?: number;
  lang?: string;
  region?: string;
}

// Interface for fundamentalsTimeSeries options
interface FundamentalsTimeSeriesOptions {
  period1: Date | string | number;
  period2?: Date | string | number;
  type?: 'quarterly' | 'annual' | 'trailing';
  module: 'financials' | 'balance-sheet' | 'cash-flow' | 'all'; // Changed from optional to required
  lang?: string;
  region?: string;
  merge?: boolean;
  padTimeSeries?: boolean;
}

// Interface for Yahoo Finance insights options
interface InsightsOptions {
  reportsCount?: number;
  lang?: string;
  region?: string;
}

@Injectable()
export class FinanceService implements OnModuleInit {
  private readonly logger = new Logger(FinanceService.name);
  
  onModuleInit() {
    this.logger.log('FinanceService initialized');
  }

  /**
   * Search for symbols with advanced options
   */
  async searchSymbols(query: string, options: SearchOptions = {}) {
    try {
      // Use default quotesCount if not explicitly provided
      if (!options.quotesCount && typeof options.quotesCount !== 'number') {
        options.quotesCount = 10;
      }
      
      const result = await yahooFinance.search(query, options);
      return result.quotes;
    } catch (error) {
      this.logger.error(`Failed to search for ${query}`, error);
      throw error;
    }
  }

  /**
   * Get real-time quote for one or multiple symbols
   * 
   * @param symbol - Single symbol or array of symbols
   * @param options - Quote options
   * 
   * Note: Quirks to be aware of:
   * 1. Earnings dates (earningsTimestamp*) can be inaccurate by +/- 2 days
   * 2. Delisted symbols return undefined (original API returns quoteType: "NONE")
   */
  async getQuote(symbol: string | string[], options: QuoteOptions = {}) {
    try {
      // Type assertion to handle the type mismatch
      return await yahooFinance.quote(symbol, options as any);
    } catch (error) {
      const symbolStr = Array.isArray(symbol) ? symbol.join(',') : symbol;
      this.logger.error(`Failed to fetch quote for ${symbolStr}`, error);
      throw error;
    }
  }

  /**
   * Get historical data for a symbol
   * 
   * Note: This API is more limited than the chart API:
   * - Events (prices, dividends, and stock splits) must be queried separately
   * - Interval can only be "1d", "1wk", "1mo"
   * - For more flexibility, consider using getChartData instead
   */
  async getHistoricalData(
    symbol: string, 
    period1: Date, 
    period2: Date, 
    interval: HistoricalInterval = '1d'
  ) {
    try {
      return await yahooFinance.historical(symbol, {
        period1,
        period2,
        interval,
        includeAdjustedClose: true,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch historical data for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get trending symbols in a specific region
   */
  async getTrending(region = 'US') {
    try {
      const result = await yahooFinance.trendingSymbols(region);
      return result.quotes;
    } catch (error) {
      this.logger.error(`Failed to fetch trending symbols for ${region}`, error);
      throw error;
    }
  }

  /**
   * Get chart data for a symbol
   */
  async getChartData(symbol: string, options: ChartOptions) {
    try {
      return await yahooFinance.chart(symbol, options);
    } catch (error) {
      this.logger.error(`Failed to fetch chart data for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get detailed quote summary for a symbol
   * 
   * @param symbol - Yahoo Finance symbol
   * @param options - Options containing modules to query
   * 
   * Available modules include: assetProfile, balanceSheetHistory,
   * balanceSheetHistoryQuarterly, calendarEvents, cashflowStatementHistory,
   * cashflowStatementHistoryQuarterly, defaultKeyStatistics, earnings,
   * earningsHistory, earningsTrend, financialData, fundOwnership, fundPerformance,
   * fundProfile, incomeStatementHistory, incomeStatementHistoryQuarterly,
   * indexTrend, industryTrend, insiderHolders, insiderTransactions,
   * institutionOwnership, majorDirectHolders, majorHoldersBreakdown,
   * netSharePurchaseActivity, price, quoteType, recommendationTrend, secFilings,
   * sectorTrend, summaryDetail, summaryProfile, topHoldings,
   * upgradeDowngradeHistory
   */
  async getQuoteSummary(symbol: string, options: {modules?: string[]} = {}): Promise<any> {
    try {
      // If no modules specified, use defaults
      if (!options.modules || options.modules.length === 0) {
        options.modules = ['price', 'summaryDetail'];
      }
      
      // More aggressive type casting to bypass TypeScript checks
      // This is necessary because the Yahoo Finance library's type definitions 
      // may not perfectly match our string[] input
      return await yahooFinance.quoteSummary(symbol, {
        modules: options.modules
      } as any);
    } catch (error) {
      this.logger.error(`Failed to fetch quote summary for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get fundamentals time series data for a symbol
   * 
   * @param symbol - Yahoo Finance symbol
   * @param options - Options for fundamentals time series query
   * 
   * This API provides financial statement data over time periods:
   * - Financial data (income statements)
   * - Balance sheet data
   * - Cash flow data
   * 
   * Available types: quarterly (default), annual, trailing
   */
  async getFundamentalsTimeSeries(symbol: string, options: FundamentalsTimeSeriesOptions) {
    try {
      // Ensure options object has required properties
      const queryOptions = {
        period1: options.period1,
        period2: options.period2 || new Date(),
        type: options.type || 'quarterly',
        module: options.module, // This is now required in the interface
        lang: options.lang || 'en-US',
        region: options.region || 'US',
        merge: options.merge !== undefined ? options.merge : false,
        padTimeSeries: options.padTimeSeries !== undefined ? options.padTimeSeries : false
      };

      return await yahooFinance.fundamentalsTimeSeries(symbol, queryOptions);
    } catch (error) {
      this.logger.error(`Failed to fetch fundamentals time series for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get insights for a symbol
   * 
   * @param symbol - Yahoo Finance symbol
   * @param options - Options for insights query
   * 
   * This API provides comprehensive insights about a stock including:
   * - Technical analysis (short-term, intermediate-term, long-term outlooks)
   * - Company snapshot with sector comparison
   * - Analyst recommendations and price targets
   * - Significant events and reports
   */
  async getInsights(symbol: string, options: InsightsOptions = {}) {
    try {
      const queryOptions = {
        reportsCount: options.reportsCount || 5,
        lang: options.lang || 'en-US',
        region: options.region || 'US'
      };

      return await yahooFinance.insights(symbol, queryOptions);
    } catch (error) {
      this.logger.error(`Failed to fetch insights for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get daily gainers - stocks with biggest percentage gains
   */
  async getDailyGainers(options: TrendingQueryOptions = {}) {
    try {
      return await yahooFinance.dailyGainers(options);
    } catch (error) {
      this.logger.error('Failed to fetch daily gainers', error);
      throw error;
    }
  }
}
