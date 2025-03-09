import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, ParseBoolPipe, PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import {ParseDatePipe} from '../common/pipes/parse-date.pipe';
import { FinanceService } from './finance.service';

@Injectable()
export class IntervalValidationPipe implements PipeTransform {
  private readonly allowedIntervals = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'];

  transform(value: any, metadata: ArgumentMetadata) {
    if (!this.allowedIntervals.includes(value)) {
      throw new BadRequestException(`Invalid interval: ${value}. Allowed values are: ${this.allowedIntervals.join(', ')}`);
    }
    return value;
  }
}

/**
 * Validates that historical intervals are one of: "1d", "1wk", "1mo"
 * The historical API is more limited than the chart API
 */
@Injectable()
export class HistoricalIntervalValidationPipe implements PipeTransform {
  private readonly allowedIntervals = ['1d', '1wk', '1mo'];

  transform(value: any, metadata: ArgumentMetadata) {
    if (!this.allowedIntervals.includes(value)) {
      throw new BadRequestException(
        `Invalid historical interval: ${value}. Historical API only allows: ${this.allowedIntervals.join(', ')}. For more interval options, use the chart API.`
      );
    }
    return value;
  }
}

/**
 * Transform comma-separated string into an array
 */
@Injectable()
export class ParseArrayPipe implements PipeTransform {
  transform(value: string): string[] {
    if (!value) return [];
    return value.split(',').map(item => item.trim());
  }
}

/**
 * Common Yahoo Finance quote fields for validation
 */
const COMMON_QUOTE_FIELDS = [
  'symbol', 'shortName', 'longName', 'displayName', 'quoteType',
  'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent',
  'regularMarketVolume', 'regularMarketDayHigh', 'regularMarketDayLow',
  'regularMarketOpen', 'regularMarketPreviousClose', 'bid', 'ask',
  'fiftyTwoWeekHigh', 'fiftyTwoWeekLow', 'marketCap', 'trailingPE',
  'dividendRate', 'dividendYield', 'currency', 'exchange', 
  'market', 'marketState', 'epsTrailingTwelveMonths', 'epsForward'
];

/**
 * Transform and validate field names for quote API
 */
@Injectable()
export class QuoteFieldsValidationPipe implements PipeTransform {
  transform(values: string[]): string[] {
    if (!values || values.length === 0) return [];
    
    // Log warning for any fields not in the common list, but don't block them
    // as Yahoo Finance API may have fields not in our common list
    const unknownFields = values.filter(field => !COMMON_QUOTE_FIELDS.includes(field));
    if (unknownFields.length > 0) {
      console.warn(`Warning: Using potentially unsupported quote fields: ${unknownFields.join(', ')}`);
    }
    
    return values;
  }
}

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('search')
  async searchSymbols(
    @Query('query') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('newsCount', new DefaultValuePipe(4), ParseIntPipe) newsCount: number,
    @Query('enableFuzzyQuery', new DefaultValuePipe(false), ParseBoolPipe) enableFuzzyQuery: boolean,
    @Query('lang', new DefaultValuePipe('en-US')) lang: string,
    @Query('region', new DefaultValuePipe('US')) region: string,
    @Query('quotesQueryId', new DefaultValuePipe('tss_match_phrase_query')) quotesQueryId: string,
    @Query('multiQuoteQueryId', new DefaultValuePipe('multi_quote_single_token_query')) multiQuoteQueryId: string,
    @Query('newsQueryId', new DefaultValuePipe('news_cie_vespa')) newsQueryId: string,
    @Query('enableCb', new DefaultValuePipe(true), ParseBoolPipe) enableCb: boolean,
    @Query('enableNavLinks', new DefaultValuePipe(true), ParseBoolPipe) enableNavLinks: boolean,
    @Query('enableEnhancedTrivialQuery', new DefaultValuePipe(true), ParseBoolPipe) enableEnhancedTrivialQuery: boolean,
  ) {
    const options = {
      quotesCount: limit,
      newsCount,
      enableFuzzyQuery,
      lang,
      region,
      quotesQueryId,
      multiQuoteQueryId,
      newsQueryId,
      enableCb,
      enableNavLinks,
      enableEnhancedTrivialQuery,
    };
    
    // No need to clean up undefined options since all parameters now have default values
    return this.financeService.searchSymbols(query, options);
  }

  @Get('chart')
  async getChartData(
    @Query('symbol', new DefaultValuePipe('AAPL')) symbol: string,
    @Query('period1', new DefaultValuePipe(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())) period1: string,
    @Query('period2', new DefaultValuePipe(new Date().toISOString())) period2: string,
    @Query('interval', new DefaultValuePipe('1d'), new IntervalValidationPipe()) interval: string,
    @Query('includePrePost', new DefaultValuePipe('true'), ParseBoolPipe) includePrePost: boolean,
    @Query('events', new DefaultValuePipe('div|split|earn')) events: string,
    @Query('lang', new DefaultValuePipe('en-US')) lang: string,
    @Query('return', new DefaultValuePipe('array')) returnType: 'array' | 'object',
    @Query('useYfid', new DefaultValuePipe('true'), ParseBoolPipe) useYfid: boolean,
  ) {
    const options = {
      period1,
      period2,
      interval: interval as '1d' | '1wk' | '1mo' | '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '5d' | '3mo',
      includePrePost,
      events,
      lang, 
      return: returnType,
      useYfid,
    };
    
    return this.financeService.getChartData(symbol, options);
  }

  /**
   * Get historical price data for a symbol
   * Note: For more flexibility with intervals and events, use the chart endpoint
   */
  @Get('historical')
  async getHistoricalData(
    @Query('symbol', new DefaultValuePipe('AAPL')) symbol: string,
    @Query('from', new DefaultValuePipe(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()), ParseDatePipe) from: Date,
    @Query('to', new DefaultValuePipe(new Date().toISOString()), ParseDatePipe) to: Date,
    @Query('interval', new DefaultValuePipe('1d'), new HistoricalIntervalValidationPipe()) interval: '1d' | '1wk' | '1mo',
  ) {
    return this.financeService.getHistoricalData(symbol, from, to, interval);
  }

  /**
   * Get real-time quote for one or multiple symbols
   * 
   * Notes: 
   * 1. For multiple symbols, use comma-separated list: AAPL,MSFT,GOOGL
   * 2. For fields, use comma-separated list of field names
   * 3. Return type can be 'array', 'map', or 'object'
   */
  @Get('quote')
  async getQuote(
    @Query('symbol', new DefaultValuePipe('AAPL')) symbol: string,
    @Query('fields', new ParseArrayPipe(), new QuoteFieldsValidationPipe()) fields?: string[],
    @Query('return', new DefaultValuePipe('array')) returnType?: 'array' | 'map' | 'object'
  ) {
    const options: any = {};
    
    // Only add non-empty fields to options
    if (fields && fields.length > 0) {
      options.fields = fields;
    }
    
    if (returnType) {
      options.return = returnType;
    }
    
    // Handle both single and multiple symbols
    const symbols = symbol.includes(',') ? symbol.split(',').map(s => s.trim()) : symbol;
    
    return this.financeService.getQuote(symbols, options);
  }

  @Get('trending')
  async getTrending(
    @Query('region', new DefaultValuePipe('US')) region: string
  ) {
    return this.financeService.getTrending(region);
  }
}

/* 
Example test URLs:

1. Search for symbols:
   http://localhost:3001/api/finance/search?query=AAPL&limit=5
   
   Advanced search:
   http://localhost:3001/api/finance/search?query=AAPL&limit=5&region=US&lang=en-US&enableFuzzyQuery=true

2. Get quote:
   http://localhost:3001/api/finance/quote              (uses default symbol AAPL)
   http://localhost:3001/api/finance/quote?symbol=MSFT  (single symbol)
   http://localhost:3001/api/finance/quote?symbol=AAPL,MSFT,GOOGL (multiple symbols)
   http://localhost:3001/api/finance/quote?symbol=AAPL&fields=shortName,regularMarketPrice,regularMarketChange (filtered fields)
   http://localhost:3001/api/finance/quote?symbol=AAPL,MSFT&return=object (return as object)
   
   Common fields:
   symbol, shortName, longName, displayName, quoteType, regularMarketPrice,
   regularMarketChange, regularMarketChangePercent, regularMarketVolume, 
   regularMarketDayHigh, regularMarketDayLow, regularMarketOpen,
   regularMarketPreviousClose, bid, ask, fiftyTwoWeekHigh, fiftyTwoWeekLow,
   marketCap, trailingPE, dividendRate, dividendYield, currency, exchange

3. Get historical data (limited to daily, weekly, or monthly intervals):
   http://localhost:3001/api/finance/historical         (uses all defaults - last 30 days of AAPL with daily data)
   http://localhost:3001/api/finance/historical?symbol=AAPL&from=2023-01-01&to=2023-12-31&interval=1wk

4. Get trending symbols:
   http://localhost:3001/api/finance/trending
   http://localhost:3001/api/finance/trending?region=US

5. Get chart data (more flexible with intervals and includes events):
   http://localhost:3001/api/finance/chart              (uses all defaults - last 30 days of AAPL)
   http://localhost:3001/api/finance/chart?symbol=AAPL&period1=2023-01-01&period2=2023-12-31&interval=15m&return=object
*/
