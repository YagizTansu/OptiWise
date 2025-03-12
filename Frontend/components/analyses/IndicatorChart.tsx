import { useRef, useEffect, useState } from 'react';
import styles from '../../styles/Analyses.module.css';
import { FaInfoCircle, FaExpand, FaDownload } from 'react-icons/fa';
import { Chart } from 'chart.js';
import axios from 'axios';

interface IndicatorChartProps {
  symbol: string;
}

// Define interfaces for the data structure
interface ChartDataPoint {
  timestamp: number;
  close: number;
  volume: number;
  high: number;
  low: number;
  open: number;
}

interface ProcessedData {
  labels: string[];
  indicators: number[];
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ProcessedData>({ labels: [], indicators: [] });
  const [timeframe, setTimeframe] = useState('1y');
  const [showInfo, setShowInfo] = useState(false);
  
  const indicatorChartRef = useRef<HTMLCanvasElement>(null);
  const indicatorChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (symbol) {
      loadChartData(timeframe);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    // Clear previous chart if it exists
    if (indicatorChartInstance.current) {
      indicatorChartInstance.current.destroy();
    }
    
    // Create the indicator chart
    if (indicatorChartRef.current && chartData.labels.length > 0) {
      indicatorChartInstance.current = createIndicatorChart(indicatorChartRef.current, chartData);
    }
    
    return () => {
      if (indicatorChartInstance.current) {
        indicatorChartInstance.current.destroy();
      }
    };
  }, [chartData]);

  const loadChartData = async (timeframe: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const period = timeframeToDateRange(timeframe);
      const response = await axios.get(`http://localhost:3001/api/finance/chart`, {
        params: {
          symbol: symbol,
          period1: period.from,
          period2: period.to,
          interval: period.interval,
          includePrePost: true,
          events: 'div|split|earn'
        }
      });
      
      if (response.data && response.data.quotes && response.data.quotes.length > 0) {
        // Extract data from the quotes array
        const quotes = response.data.quotes;
        
        // Extract necessary data points for Wyckoff calculation
        const timestamps = quotes.map((q: any) => q.date || q.timestamp);
        const closes = quotes.map((q: any) => q.close || q.adjclose);
        const volumes = quotes.map((q: any) => q.volume);
        const highs = quotes.map((q: any) => q.high);
        const lows = quotes.map((q: any) => q.low);
        
        // Create consolidated data structure for the calculation
        const quoteData = {
          close: closes,
          volume: volumes,
          high: highs,
          low: lows
        };
        
        // Process data for Wyckoff indicator
        const processedData = calculateWyckoffIndicator(timestamps, quoteData);
        setChartData(processedData);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      console.error('Failed to load indicator data:', error);
      setError('Failed to load indicator data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const timeframeToDateRange = (timeframe: string) => {
    const now = new Date();
    const endDate = now.toISOString();
    let startDate;
    let interval = '1d';
    
    switch (timeframe) {
      case '1w':
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
        interval = '60m';
        break;
      case '3d':
        startDate = new Date(now.setDate(now.getDate() - 3)).toISOString();
        interval = '30m';
        break;
      case 'd':
        startDate = new Date(now.setDate(now.getDate() - 1)).toISOString();
        interval = '5m';
        break;
      case 'w':
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
        interval = '60m';
        break;
      case '1m':
        startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        interval = '1d';
        break;
      case '6m':
        startDate = new Date(now.setMonth(now.getMonth() - 6)).toISOString();
        interval = '1d';
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
        interval = '1d';
        break;
      case '3y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 3)).toISOString();
        interval = '1wk';
        break;
      case '5y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 5)).toISOString();
        interval = '1wk';
        break;
      default:
        startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
        interval = '1d';
    }
    
    return { from: startDate, to: endDate, interval };
  };

  /**
   * Calculate the Wyckoff Causes/Effects indicator based on price and volume data
   * This combines momentum and supply/demand factors to create an oscillating indicator
   */
  const calculateWyckoffIndicator = (timestamps: any[], quotes: any): ProcessedData => {
    if (!timestamps.length || !quotes.close || !quotes.volume) {
      return { labels: [], indicators: [] };
    }
    
    const closes = quotes.close;
    const volumes = quotes.volume;
    const highs = quotes.high;
    const lows = quotes.low;
    
    const labels: string[] = [];
    const indicators: number[] = [];
    
    // We need at least 14 data points to calculate meaningful indicators
    const lookback = Math.min(14, closes.length - 1);
    
    // Process the data
    for (let i = lookback; i < closes.length; i++) {
      // Format date from timestamp
      // Handle both timestamp number and date string formats
      const date = typeof timestamps[i] === 'number' 
        ? new Date(timestamps[i] * 1000) 
        : new Date(timestamps[i]);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Calculate price momentum (rate of change over lookback period)
      const priceChange = closes[i] / closes[i - lookback] - 1;
      
      // Calculate volume trend (is volume increasing or decreasing?)
      let volumeSum = 0;
      let prevVolumeSum = 0;
      
      for (let j = 0; j < lookback; j++) {
        if (volumes[i - j]) volumeSum += volumes[i - j];
        if (volumes[i - j - lookback]) prevVolumeSum += volumes[i - j - lookback];
      }
      
      const volumeTrend = prevVolumeSum > 0 ? volumeSum / prevVolumeSum - 1 : 0;
      
      // Calculate price range volatility
      let trueRange = 0;
      for (let j = 0; j < lookback; j++) {
        if (highs[i - j] && lows[i - j]) {
          const prevClose = i - j - 1 >= 0 ? closes[i - j - 1] : closes[i - j];
          const currentTR = Math.max(
            highs[i - j] - lows[i - j],
            Math.abs(highs[i - j] - prevClose),
            Math.abs(lows[i - j] - prevClose)
          );
          trueRange += currentTR;
        }
      }
      trueRange /= lookback;
      
      // Normalize the true range
      const normalizedTrueRange = trueRange / closes[i] * 100;
      
      // Calculate Wyckoff Indicator combining price momentum, volume trend, and volatility
      // This is a simplified interpretation of Wyckoff principles
      const wyckoffIndicator = (priceChange * 10) * (1 + volumeTrend * 0.5) * (1 - normalizedTrueRange * 0.05);
      
      // Scale the indicator to fit within our chart range (-15 to 15)
      const scaledIndicator = Math.max(Math.min(wyckoffIndicator * 100, 15), -15);
      
      indicators.push(scaledIndicator);
    }
    
    return { labels, indicators };
  };

  const createIndicatorChart = (canvas: HTMLCanvasElement, data: ProcessedData) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Wyckoff Causes/Effects',
            data: data.indicators,
            borderColor: 'rgba(53, 162, 235, 0.7)',
            backgroundColor: 'rgba(53, 162, 235, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 0,
          },
          {
            label: 'Zero Line',
            data: data.labels.map(() => 0), // Flat line at zero
            borderColor: 'rgba(100, 100, 100, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            tension: 0,
            fill: false,
            pointRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            min: -15,
            max: 15,
            title: {
              display: true,
              text: 'Value',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.1)'
            }
          },
          x: {
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.1)'
            }
          }
        },
        plugins: {
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 700
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                const value = context.raw as number;
                let interpretation = '';
                
                if (value > 5) interpretation = 'Strong upward momentum with confirmation';
                else if (value > 0) interpretation = 'Positive momentum';
                else if (value > -5) interpretation = 'Weakening momentum';
                else interpretation = 'Strong downward momentum with confirmation';
                
                return [`Value: ${value.toFixed(2)}`, `Interpretation: ${interpretation}`];
              }
            }
          },
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        }
      }
    });
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  const toggleInfoDisplay = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h2>Wyckoff Causes/Effects - {symbol}</h2>
        <div className={styles.chartControls}>
          <div className={styles.indicatorControls}>
            <select 
              value={timeframe} 
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className={styles.modernSelect}
            >
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="3y">3 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>
          <button className={styles.modernActionButton} title="Download Chart">
            <FaDownload className={styles.buttonIcon} /> 
            <span>Download</span>
          </button>
          <button className={styles.modernActionButton} title="Fullscreen">
            <FaExpand className={styles.buttonIcon} /> 
            <span>Fullscreen</span>
          </button>
          <button 
            className={styles.modernIconButton} 
            onClick={toggleInfoDisplay}
            title="Show indicator information"
          >
            <FaInfoCircle />
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className={styles.infoBox}>
          <p>The Wyckoff indicator shows supply/demand balance based on price and volume.</p>
          <p>Values above zero suggest accumulation (bullish), while values below zero suggest distribution (bearish).</p>
          <p>Divergence between indicator and price can signal potential reversals.</p>
          <p className={styles.disclaimerText}>Disclaimer: This analysis is for informational purposes only and does not constitute investment advice.</p>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading indicator...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={() => loadChartData(timeframe)}>Retry</button>
        </div>
      ) : (
        <div className={styles.chartContainer} style={{ height: '300px' }}>
          <canvas ref={indicatorChartRef}></canvas>
        </div>
      )}
    </div>
  );
};

export default IndicatorChart;
