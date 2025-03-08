import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import yahooFinance from 'yahoo-finance2';

@Injectable()
export class FinanceService implements OnModuleInit {
  private readonly logger = new Logger(FinanceService.name);
  
  onModuleInit() {
    this.logger.log('FinanceService initialized');
  }

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol: string) {
    try {
      return await yahooFinance.quote(symbol);
    } catch (error) {
      this.logger.error(`Failed to fetch quote for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Get historical data for a symbol
   */
  async getHistoricalData(symbol: string, period1: Date, period2: Date, interval = '1d') {
    try {
      return await yahooFinance.historical(symbol, {
        period1,
        period2,
        interval: interval as any,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch historical data for ${symbol}`, error);
      throw error;
    }
  }

  /**
   * Search for symbols
   */
  async searchSymbols(query: string, limit = 10) {
    try {
      const result = await yahooFinance.search(query, { quotesCount: limit });
      return result.quotes;
    } catch (error) {
      this.logger.error(`Failed to search for ${query}`, error);
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
}
