import { useRef, useEffect, useState } from 'react';
import styles from '../../../styles/Analyses.module.css';
import { FaChartLine, FaChartBar, FaEyeSlash, FaInfoCircle, FaArrowLeft, FaArrowRight, FaSyncAlt, FaDownload, FaExpand, FaQuestion, FaTimes } from 'react-icons/fa';
import { Chart, ChartDataset } from 'chart.js';
import { fetchPriceVolumeData, PriceVolumeData } from '../../../services/api/finance';

// Define proper chart dataset types
interface PriceDataset extends ChartDataset<'line'> {
  type: 'line';
  yAxisID: string;
  segment?: {
    borderColor: (ctx: { p0DataIndex: number }) => string;
  };
}

interface VolumeDataset extends ChartDataset<'bar'> {
  type: 'bar';
  yAxisID: string;
}

interface PriceVolumeChartProps {
  symbol: string;
}

const PriceVolumeChart: React.FC<PriceVolumeChartProps> = ({ symbol }) => {
  const [activeTimeframe, setActiveTimeframe] = useState('1y');
  const [isLoading, setIsLoading] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{
    labels: string[];
    prices: number[];
    volumes: number[];
  }>({ labels: [], prices: [], volumes: [] });
  
  const priceChartRef = useRef<HTMLCanvasElement>(null);
  const priceChartInstance = useRef<Chart | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const timeframes = [
    { label: 'MAX', value: 'max' },
    { label: '10Y', value: '10y' },
    { label: '5Y', value: '5y' },
    { label: '2Y', value: '2y' },
    { label: '1Y', value: '1y' },
    { label: '6M', value: '6mo' },
    { label: '3M', value: '3mo' },
    { label: '1M', value: '1mo' },
  ];

  useEffect(() => {
    if (symbol) {
      loadChartData(activeTimeframe);
    }
  }, [symbol, activeTimeframe]);

  useEffect(() => {
    // Clear previous chart if it exists
    if (priceChartInstance.current) {
      priceChartInstance.current.destroy();
    }
    
    // Create the price and volume chart
    if (priceChartRef.current && chartData.labels.length > 0) {
      priceChartInstance.current = createPriceVolumeChart(priceChartRef.current, chartData);
    }
    
    return () => {
      if (priceChartInstance.current) {
        priceChartInstance.current.destroy();
      }
    };
  }, [chartData, showVolume]);

  const loadChartData = async (timeframe: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the service function from finance.ts
      const data = await fetchPriceVolumeData(symbol, timeframe);
      
      // Transform the data to match our component's expected format
      setChartData({
        labels: data.price.dates,
        prices: data.price.values,
        volumes: data.volume.values
      });
    } catch (error) {
      console.error('Failed to load chart data:', error);
      setError('Failed to load chart data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const createPriceVolumeChart = (canvas: HTMLCanvasElement, data: any) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Determine market phases for coloring
    const phases = determinePhasesColors(data.prices);

    // Create datasets array with price dataset
    const priceDataset: PriceDataset = {
      type: 'line',
      label: 'Price',
      data: data.prices,
      borderColor: phases.colors as string[],
      segment: {
        borderColor: (ctx: { p0DataIndex: number }) => phases.segments[ctx.p0DataIndex],
      },
      borderWidth: 4,  // Thicker lines
      tension: 0.3,    // Matching the seasonality chart tension
      yAxisID: 'y',
      fill: false,
      pointRadius: 0,
    };

    // Initialize datasets with price dataset
    const datasets: (PriceDataset | VolumeDataset)[] = [priceDataset];

    // Add volume dataset if showVolume is true
    if (showVolume) {
      const volumeDataset: VolumeDataset = {
        type: 'bar',
        label: 'Volume',
        data: data.volumes,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      };
      datasets.push(volumeDataset);
    }

    return new Chart(ctx, {
      type: 'bar', // Base type is bar for volume
      data: {
        labels: data.labels,
        datasets: datasets as ChartDataset<'line' | 'bar', number[]>[]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.1)'
            }
          },
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Price',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.1)'
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: showVolume,
              text: 'Volume',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            display: showVolume,
            grid: {
              drawOnChartArea: false, // Only show grid lines for the price y-axis
              color: 'rgba(200, 200, 200, 0.1)'
            },
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
            displayColors: true,
            usePointStyle: true
          },
          legend: {
            position: 'top' as const,
            align: 'end' as const,
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

  // Determine market phases and assign colors
  const determinePhasesColors = (prices: number[]) => {
    const colors: string[] = [];
    const segments: string[] = [];
    
    // Calculate price differences to determine trend changes
    for (let i = 1; i < prices.length; i++) {
      const priceDiff = prices[i] - prices[i-1];
      
      // Simple rule: if price is going up, use green; if down, use red
      // We alternate blue and orange for visual distinction in longer trends
      if (priceDiff > 0) {
        // Uptrend - alternate between blue and green based on position
        segments.push(i % 4 === 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(75, 192, 75, 1)');
      } else {
        // Downtrend - alternate between red and orange based on position
        segments.push(i % 4 === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(255, 159, 64, 1)');
      }
    }
    
    // Add a color for the first point
    segments.unshift('rgba(75, 192, 75, 1)');
    
    return { colors, segments };
  };

  const handleRefresh = () => {
    loadChartData(activeTimeframe);
  };

  const toggleVolumeDisplay = () => {
    setShowVolume(prev => !prev);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (priceChartRef.current) {
      const link = document.createElement('a');
      link.download = `${symbol}-chart-${activeTimeframe}.png`;
      link.href = priceChartRef.current.toDataURL('image/png');
      link.click();
    }
  };

  const toggleInfoPanel = () => {
    setIsInfoVisible(!isInfoVisible);
  };

  return (
    <div className={`${styles.chartCard} ${isFullscreen ? styles.fullscreenCard : ''}`}>
      <div className={styles.chartHeader}>
        <h2>{symbol} Price/Volume Chart</h2>
        <div className={styles.chartControls}>
          <div className={styles.timeframeButtons}>
            {timeframes.map(tf => (
              <button
                key={tf.value}
                className={`${styles.modernTabButton} ${activeTimeframe === tf.value ? styles.activeTab : ''}`}
                onClick={() => setActiveTimeframe(tf.value)}
              >
                {tf.label}
              </button>
            ))}
          </div>
          <div className={styles.headerControls}>
            <button
              className={`${styles.modernIconButton} ${styles.volumeToggle} ${showVolume ? styles.active : ''}`} 
              onClick={toggleVolumeDisplay}
              title={showVolume ? "Hide Volume" : "Show Volume"}
            >
              {showVolume ? <FaChartBar /> : <FaEyeSlash />}
            </button>
            <button className={styles.modernIconButton} onClick={handleRefresh} title="Refresh Data">
              <FaSyncAlt />
            </button>
            <button className={styles.modernActionButton} onClick={handleDownload} title="Download Chart">
              <FaDownload className={styles.buttonIcon} /> 
              <span>Download</span>
            </button>
            <button className={styles.modernActionButton} onClick={toggleFullscreen} title="Fullscreen">
              <FaExpand className={styles.buttonIcon} /> 
              <span>Fullscreen</span>
            </button>
            <button 
              className={styles.modernIconButton} 
              onClick={toggleInfoPanel} 
              title="Learn About Price Charts"
            >
              <FaQuestion />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading chart data for {symbol}...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}><FaInfoCircle /></div>
          <p>{error}</p>
          <button className={styles.modernActionButton} onClick={handleRefresh}>
            Try Again
          </button>
        </div>
      ) : (
        <div className={`${styles.chartContainer} ${isFullscreen ? styles.fullscreenChart : ''}`} style={{ height: '550px' }}>
          <canvas ref={priceChartRef}></canvas>
        </div>
      )}

      {/* Replaced inline info box with modal overlay */}
      {isInfoVisible && (
        <div className={styles.modalOverlay} onClick={toggleInfoPanel}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Understanding Price/Volume Charts</h3>
              <button 
                onClick={toggleInfoPanel} 
                className={styles.modernIconButton}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p><strong>Price Chart:</strong> Shows the historical price movement of {symbol} over time. The line color changes to indicate upward (green/blue) and downward (red/orange) price movements.</p>
              <p><strong>Volume:</strong> Displayed as bars at the bottom, representing the trading volume for each period. Higher volume often indicates stronger price movements.</p>
              <p><strong>Timeframes:</strong> Select different time periods to analyze short-term and long-term trends.</p>
              <p><strong>Chart Analysis:</strong></p>
              <ul className={styles.infoList}>
                <li><strong>Uptrends:</strong> Series of higher highs and higher lows indicates bullish momentum.</li>
                <li><strong>Downtrends:</strong> Series of lower highs and lower lows indicates bearish momentum.</li>
                <li><strong>Support/Resistance:</strong> Price levels where the asset historically struggles to move below/above.</li>
                <li><strong>Volume Confirmation:</strong> Price movements accompanied by high volume tend to be more significant.</li>
              </ul>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modernActionButton} onClick={toggleInfoPanel}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceVolumeChart;
