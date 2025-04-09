// Chart data types
export interface ChartDataPoint {
  timestamp: number;
  close: number;
  open: number | undefined;
  high: number | undefined;
  low: number | undefined;
  volume: number | undefined;
  date: string;
  fullDate: Date;
  currency?: string;
}

export interface ChartDataResponse {
  meta: {
    symbol: string;
    currency: string;
    exchangeName?: string;
    instrumentType?: string;
    firstTradeDate?: number;
    regularMarketTime?: number;
    gmtoffset?: number;
    timezone?: string;
    exchangeTimezoneName?: string;
    chartPreviousClose?: number;
    priceHint?: number;
  };
  quotes: {
    timestamp?: number;
    date?: string | number;
    time?: string | number;
    open?: number;
    high?: number;
    low?: number;
    close: number;
    volume?: number;
  }[];
}

export interface QuoteData {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  [key: string]: any; // For other potential fields
}

export interface PriceVolumeData {
  price: {
    dates: string[];
    values: number[];
  };
  volume: {
    dates: string[];
    values: number[];
  };
  priceChange: number;
  percentChange: number;
  minPrice: number;
  maxPrice: number;
  avgVolume: number;
  volumeChange: number;
  currency?: string;
}// Re-export all types from their respective files
export * from './chart.types';

