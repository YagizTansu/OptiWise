import { useRef, useEffect, useState } from 'react';
import styles from '../../styles/Analyses.module.css';
import { FaChartLine, FaChartBar, FaEyeSlash, FaInfoCircle, FaArrowLeft, FaArrowRight, FaSyncAlt } from 'react-icons/fa';
import { Chart, ChartDataset } from 'chart.js';

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
  const [chartData, setChartData] = useState<{
    labels: string[];
    prices: number[];
    volumes: number[];
  }>({ labels: [], prices: [], volumes: [] });
  
  const priceChartRef = useRef<HTMLCanvasElement>(null);
  const priceChartInstance = useRef<Chart | null>(null);

  const timeframes = [
    { label: '1W', value: '1w' },
    { label: '5Y', value: '5y' },
    { label: '3Y', value: '3y' },
    { label: '1Y', value: '1y' },
    { label: '6M', value: '6m' },
    { label: '1M', value: '1m' },
    { label: '3D', value: '3d' },
    { label: 'W', value: 'w' },
    { label: 'D', value: 'd' },
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
    
    try {
      // Here you would fetch actual data based on the symbol and timeframe
      // For now, we'll generate mock data
      const mockData = generateMockData(timeframe);
      setChartData(mockData);
    } catch (error) {
      console.error('Failed to load chart data:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (timeframe: string) => {
    const dataPoints = timeframeToDataPoints(timeframe);
    const today = new Date();
    const labels = [];
    const prices = [];
    const volumes = [];

    // Generate time labels going back from today
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      // Generate price data with some randomness but following a trend
      const trend = Math.sin(i / (dataPoints / 6)) * 100; // Creates a wavy pattern
      const basePrice = 2000; // Base price around 2000
      const randomness = Math.random() * 50 - 25; // Random fluctuation of ±25
      const price = basePrice + trend + randomness;
      prices.push(price);

      // Generate volume data
      const baseVolume = 100000; // Base volume
      const volumeRandomness = Math.random() * 50000; // Random fluctuation in volume
      const volume = baseVolume + volumeRandomness;
      volumes.push(volume);
    }

    return { labels, prices, volumes };
  };

  const timeframeToDataPoints = (timeframe: string) => {
    // Convert timeframe to approximate number of data points
    switch (timeframe) {
      case '1w': return 7;
      case '3d': return 3;
      case 'd': return 1;
      case 'w': return 7;
      case '1m': return 30;
      case '6m': return 180;
      case '1y': return 365;
      case '3y': return 365 * 3;
      case '5y': return 365 * 5;
      default: return 365; // Default to 1 year
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
      borderWidth: 2,
      tension: 0.4,
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
              text: 'Date'
            }
          },
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Price'
            }
          },
          y1: {
            type: 'linear',
            position: 'right',
            title: {
              display: showVolume,
              text: 'Volume'
            },
            display: showVolume,
            grid: {
              drawOnChartArea: false, // Only show grid lines for the price y-axis
            },
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

  const handlePrevious = () => {
    // Navigate to previous time period
    console.log('Navigate to previous period');
  };

  const handleNext = () => {
    // Navigate to next time period
    console.log('Navigate to next period');
  };

  const toggleVolumeDisplay = () => {
    setShowVolume(prev => !prev);
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleAndControls}>
          <button className={styles.modernActionButton}>
            <FaChartLine /> Advanced DPO - {symbol}
          </button>
          <button 
            className={`${styles.modernIconButton} ${styles.volumeToggle} ${showVolume ? styles.active : ''}`} 
            onClick={toggleVolumeDisplay}
            title={showVolume ? "Hide Volume" : "Show Volume"}
          >
            {showVolume ? <FaChartBar /> : <FaEyeSlash />}
          </button>
        </div>
        
        <div className={styles.timeframeControls}>
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
          <div className={styles.navigationControls}>
            <button className={styles.modernIconButton} onClick={handlePrevious}>
              <FaArrowLeft />
            </button>
            <button className={styles.modernIconButton} onClick={handleNext}>
              <FaArrowRight />
            </button>
            <button className={styles.modernIconButton} onClick={handleRefresh}>
              <FaSyncAlt />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading charts...</p>
        </div>
      ) : (
        <div className={styles.chartContainer} style={{ height: '400px' }}>
          <canvas ref={priceChartRef}></canvas>
        </div>
      )}

      <div className={styles.chartFooter}>
        <button className={styles.modernIconButton}>
          <FaInfoCircle />
        </button>
        <span className={styles.disclaimerText}>
          Price{showVolume ? " and volume" : ""} data visualization
        </span>
      </div>
    </div>
  );
};

export default PriceVolumeChart;
