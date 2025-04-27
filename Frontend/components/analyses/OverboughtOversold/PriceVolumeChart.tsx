import { useRef, useEffect, useState } from 'react';
import styles from '../../../styles/OverboughtOversold/PriceVolumeChart.module.css';
import { FaChartLine, FaChartBar, FaEyeSlash, FaInfoCircle, FaArrowLeft, FaArrowRight, FaSyncAlt, FaDownload, FaExpand, FaQuestion, FaTimes } from 'react-icons/fa';
import { Chart, ChartDataset } from 'chart.js';
import { fetchPriceVolumeData} from '../../../services/api/finance';

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

interface DPODataset extends ChartDataset<'line'> {
  type: 'line';
  yAxisID: string;
  pointBackgroundColor?: ((ctx: { dataIndex: number }) => string) | string[];
  pointBorderColor?: ((ctx: { dataIndex: number }) => string) | string[];
}

interface PriceVolumeChartProps {
  symbol: string;
}

const PriceVolumeChart: React.FC<PriceVolumeChartProps> = ({ symbol }) => {
  const [activeTimeframe, setActiveTimeframe] = useState('1y');
  const [isLoading, setIsLoading] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showDPO, setShowDPO] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{
    labels: string[];
    prices: number[];
    volumes: number[];
    dpo?: number[];
    dpoUpperBand1?: number[];
    dpoLowerBand1?: number[];
    dpoUpperBand2?: number[];
    dpoLowerBand2?: number[];
    dpoZones?: (string | null)[];
  }>({ labels: [], prices: [], volumes: [] });
  
  // Add state to store complete dataset
  const [completeDataset, setCompleteDataset] = useState<{
    labels: string[];
    prices: number[];
    volumes: number[];
    dpo?: number[];
    dpoUpperBand1?: number[];
    dpoLowerBand1?: number[];
    dpoUpperBand2?: number[];
    dpoLowerBand2?: number[];
    dpoZones?: (string | null)[];
  } | null>(null);
  
  const priceChartRef = useRef<HTMLCanvasElement>(null);
  const priceChartInstance = useRef<Chart | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const timeframes = [
    { label: '1Y', value: '1y' },
    { label: '2Y', value: '2y' },
    { label: '5Y', value: '5y' },
    { label: '10Y', value: '10y' },
    { label: 'MAX', value: 'max' },
    // { label: '6M', value: '6mo' },
    // { label: '3M', value: '3mo' },
    // { label: '1M', value: '1mo' },
  ];

  useEffect(() => {
    if (symbol) {
      if (!completeDataset) {
        // First load - fetch all data
        loadAllHistoricalData();
      } else {
        // We already have all data, just filter for the selected timeframe
        filterDataForTimeframe(activeTimeframe);
      }
    }
  }, [symbol, activeTimeframe, completeDataset]);

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
  }, [chartData, showVolume, showDPO]);

  // Function to load all historical data
  const loadAllHistoricalData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch maximum available data
      const data = await fetchPriceVolumeData(symbol, 'max');
      
      // Calculate Advanced DPO indicator on the complete dataset
      let dpoData = null;
      if (data.price.values.length > 200) {
        dpoData = calculateAdvancedDPO(data.price.values);
      }
      
      // Store the complete dataset with DPO calculations
      const fullDataset = {
        labels: data.price.dates,
        prices: data.price.values,
        volumes: data.volume.values,
        ...(dpoData && {
          dpo: dpoData.dpo,
          dpoUpperBand1: dpoData.upperBand1,
          dpoLowerBand1: dpoData.lowerBand1,
          dpoUpperBand2: dpoData.upperBand2,
          dpoLowerBand2: dpoData.lowerBand2,
          dpoZones: dpoData.zones
        })
      };
      
      setCompleteDataset(fullDataset);
      
      // Filter data for the selected timeframe
      filterDataForTimeframe(activeTimeframe);
    } catch (error) {
      console.error('Failed to load all historical data:', error);
      setError('Failed to load historical data. Please try again later.');
      setIsLoading(false);
    }
  };
  
  // Function to filter data for the selected timeframe without recalculating DPO
  const filterDataForTimeframe = (timeframe: string) => {
    if (!completeDataset) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { labels, prices, volumes, dpo, dpoUpperBand1, dpoLowerBand1, dpoUpperBand2, dpoLowerBand2, dpoZones } = completeDataset;
      
      // Determine the number of data points to include based on the timeframe
      const dataPoints = getDataPointsForTimeframe(timeframe, labels.length);
      
      // Calculate the starting index for slicing
      const startIndex = Math.max(0, labels.length - dataPoints);
      
      // Create a copy of the zones array to prevent any reference issues
      let slicedZones = dpoZones ? [...dpoZones].slice(startIndex) : undefined;
      
      // Filter the data for display while preserving the zones from the full dataset calculation
      const filteredData = {
        labels: labels.slice(startIndex),
        prices: prices.slice(startIndex),
        volumes: volumes.slice(startIndex),
        ...(dpo && {
          // Slice DPO data at the same indices as the price data
          dpo: dpo.slice(startIndex),
          dpoUpperBand1: dpoUpperBand1?.slice(startIndex),
          dpoLowerBand1: dpoLowerBand1?.slice(startIndex),
          dpoUpperBand2: dpoUpperBand2?.slice(startIndex),
          dpoLowerBand2: dpoLowerBand2?.slice(startIndex),
          // Use the copied zones array
          dpoZones: slicedZones
        })
      };
      
      // Update chart data
      setChartData(filteredData);
    } catch (error) {
      console.error('Failed to filter data for timeframe:', error);
      setError('Failed to update chart for selected timeframe.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to determine how many data points to show based on timeframe
  const getDataPointsForTimeframe = (timeframe: string, totalDataPoints: number): number => {
    // Estimated trading days per period
    switch (timeframe) {
      case '1mo': return Math.min(21, totalDataPoints);
      case '3mo': return Math.min(63, totalDataPoints);
      case '6mo': return Math.min(126, totalDataPoints);
      case '1y': return Math.min(252, totalDataPoints);
      case '2y': return Math.min(504, totalDataPoints);
      case '5y': return Math.min(1260, totalDataPoints);
      case '10y': return Math.min(2520, totalDataPoints);
      case 'max': return totalDataPoints;
      default: return Math.min(252, totalDataPoints); // Default to 1 year
    }
  };

  // Replace loadChartData to use the complete dataset approach
  const loadChartData = async (timeframe: string) => {
    // If we already have data, just filter it without recalculating
    if (completeDataset) {
      filterDataForTimeframe(timeframe);
      return;
    }
    
    // Otherwise load all data and calculate DPO on the complete dataset
    loadAllHistoricalData();
  };

  // Function to calculate Advanced DPO indicator
  const calculateAdvancedDPO = (prices: any[]) => {
    if (!prices || prices.length < 100) {
        throw new Error("Yeterli fiyat verisi yok. En az 200 veri noktası gereklidir.");
    }

    const period = 200;
    const lookbackPeriod = Math.min(prices.length, 2520);
    const bollingerPeriod = 200;
    const bollinger1SD = 1;
    const bollinger2SD = 2;

    // Basit Hareketli Ortalama (SMA) Hesaplama
    const calculateSMA = (data: any[], period: number) => {
        if (data.length < period) return [];
        return data.map((_, i) => {
            if (i < period - 1) return null;
            const slice = data.slice(i - period + 1, i + 1);
            return slice.reduce((a, b) => a + b, 0) / period;
        }).filter(v => v !== null);
    };

    const sma = calculateSMA(prices, period);

    // DPO Hesaplama (Kayma düzeltildi: t - (N/2))
    const halfPeriod = Math.floor(period / 2);
    const dpo = prices.slice(halfPeriod, prices.length - halfPeriod)
        .map((price: number, i: number) => price - sma[i]);

    if (dpo.length < lookbackPeriod) return null;

    // Normalizasyon İçin Minimum ve Maksimum Değerler
    const historicalDpo = dpo.slice(-lookbackPeriod);
    const dpoMin = Math.min(...historicalDpo);
    const dpoMax = Math.max(...historicalDpo);
    const dpoRange = dpoMax - dpoMin || 1; // Bölme hatası önleme

    // Normalizasyon
    const normalizedDPO = dpo.map((value: number) => (value - dpoMin) / dpoRange);

    // Standart Sapma Hesaplama
    const calculateStdDev = (data: any[], period: number) => {
        if (data.length < period) return [];
        return data.map((_, i) => {
            if (i < period - 1) return null;
            const slice = data.slice(i - period + 1, i + 1);
            const mean = slice.reduce((a, b) => a + b, 0) / period;
            const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
            return Math.sqrt(variance);
        }).filter(v => v !== null);
    };

    if (normalizedDPO.length < bollingerPeriod) return null;

    const bollinger200SMA = calculateSMA(normalizedDPO, bollingerPeriod);
    const stdDev = calculateStdDev(normalizedDPO, bollingerPeriod);

    // Bollinger Bantları Hesaplama
    const upperBand1 = bollinger200SMA.map((sma, i) => sma + bollinger1SD * stdDev[i]);
    const lowerBand1 = bollinger200SMA.map((sma, i) => sma - bollinger1SD * stdDev[i]);
    const upperBand2 = bollinger200SMA.map((sma, i) => sma + bollinger2SD * stdDev[i]);
    const lowerBand2 = bollinger200SMA.map((sma, i) => sma - bollinger2SD * stdDev[i]);

    // Alım / Satım Bölgeleri Belirleme
    const zones = normalizedDPO.map((value: number, i: number) => {
        if (i < normalizedDPO.length - bollinger200SMA.length) return null;
        const bbIndex = i - (normalizedDPO.length - bollinger200SMA.length);
        
        // Explicit check to ensure bbIndex is valid
        if (bbIndex < 0 || bbIndex >= lowerBand2.length) return null;
        
        // Determine zone based on value compared to Bollinger bands
        if (value < lowerBand2[bbIndex]) return 'strong-buy';
        if (value < lowerBand1[bbIndex]) return 'buy';
        if (value < upperBand1[bbIndex]) return 'hold';
        if (value < upperBand2[bbIndex]) return 'sell';
        return 'strong-sell';
    });

    return {
        dpo: normalizedDPO,
        upperBand1,
        lowerBand1,
        upperBand2,
        lowerBand2,
        zones
    };
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
    const datasets: (PriceDataset | VolumeDataset | DPODataset)[] = [priceDataset];

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
    
    // Add Advanced DPO dataset if enabled and available
    if (showDPO && data.dpo) {
      // Create an array of background colors based on zones
      const pointBackgroundColors = data.dpo.map((_: any, index: number) => {
        if (!data.dpoZones || index >= data.dpoZones.length || !data.dpoZones[index]) {
          return 'rgba(128, 128, 128, 0.7)'; // Default gray
        }
        
        const zone = data.dpoZones[index];
        switch (zone) {
          case 'strong-buy': return 'rgba(0, 128, 0, 1)'; // Green
          case 'buy': return 'rgba(0, 90, 156, 1)'; // Blue
          case 'hold': return 'rgba(0, 90, 156, 0.7)'; // Light blue
          case 'sell': return 'rgba(255, 165, 0, 1)'; // Orange
          case 'strong-sell': return 'rgba(255, 0, 0, 1)'; // Red
          default: return 'rgba(128, 128, 128, 0.7)'; // Gray
        }
      });
      
      // Add DPO line with direct color assignments instead of using a callback function
      const dpoDataset: DPODataset = {
        type: 'line',
        label: 'Advanced DPO',
        data: data.dpo,
        borderColor: 'rgba(128, 128, 128, 0.7)', // Neutral line color
        borderWidth: 2,
        tension: 0.1,
        yAxisID: 'y2',
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: pointBackgroundColors
      };
      datasets.push(dpoDataset);
      
      // Add Bollinger Bands (1 SD)
      const upperBand1Dataset: DPODataset = {
        type: 'line',
        label: 'Upper Band (1 SD)',
        data: data.dpoUpperBand1,
        borderColor: 'rgba(128, 128, 128, 0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
        tension: 0.1,
        yAxisID: 'y2',
        fill: false,
        pointRadius: 0
      };
      datasets.push(upperBand1Dataset);
      
      const lowerBand1Dataset: DPODataset = {
        type: 'line',
        label: 'Lower Band (1 SD)',
        data: data.dpoLowerBand1,
        borderColor: 'rgba(128, 128, 128, 0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
        tension: 0.1,
        yAxisID: 'y2',
        fill: false,
        pointRadius: 0
      };
      datasets.push(lowerBand1Dataset);
      
      // Add Bollinger Bands (2 SD)
      const upperBand2Dataset: DPODataset = {
        type: 'line',
        label: 'Upper Band (2 SD)',
        data: data.dpoUpperBand2,
        borderColor: 'rgba(255, 0, 0, 0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
        tension: 0.1,
        yAxisID: 'y2',
        fill: false,
        pointRadius: 0
      };
      datasets.push(upperBand2Dataset);
      
      const lowerBand2Dataset: DPODataset = {
        type: 'line',
        label: 'Lower Band (2 SD)',
        data: data.dpoLowerBand2,
        borderColor: 'rgba(0, 128, 0, 0.5)',
        borderWidth: 1,
        borderDash: [5, 5],
        tension: 0.1,
        yAxisID: 'y2',
        fill: false,
        pointRadius: 0
      };
      datasets.push(lowerBand2Dataset);
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
          },
          y2: {
            type: 'linear',
            position: 'right',
            title: {
              display: showDPO,
              text: 'Advanced DPO',
              font: {
                size: 14,
                weight: 'bold' as const
              }
            },
            display: showDPO,
            grid: {
              drawOnChartArea: false,
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
            usePointStyle: true,
            callbacks: {
              afterBody: function(context) {
                // Add DPO zone information if enabled
                if (showDPO && data.dpoZones && context[0].dataIndex < data.dpoZones.length) {
                  const zone = data.dpoZones[context[0].dataIndex];
                  if (!zone) return '';
                  
                  let zoneText = '';
                  let signal = '';
                  
                  switch(zone) {
                    case 'strong-buy':
                      signal = 'Strong Buy';
                      zoneText = 'GREEN ZONE';
                      break;
                    case 'buy':
                    case 'hold':
                      signal = 'Hold';
                      zoneText = 'BLUE ZONE';
                      break;
                    case 'sell':
                      signal = 'Sell';
                      zoneText = 'ORANGE ZONE';
                      break;
                    case 'strong-sell':
                      signal = 'Strong Sell';
                      zoneText = 'RED ZONE';
                      break;
                  }
                  
                  return `\nAdvanced DPO: ${zoneText}\nSignal: ${signal}`;
                }
                return '';
              }
            }
          },
          legend: {
            position: 'top' as const,
            align: 'end' as const,
            labels: {
              boxWidth: 15,
              usePointStyle: true,
              pointStyle: 'circle',
              filter: function(legendItem) {
                // Hide the Bollinger Bands from the legend
                return !['Upper Band (1 SD)', 'Lower Band (1 SD)', 
                        'Upper Band (2 SD)', 'Lower Band (2 SD)'].includes(legendItem.text);
              }
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
    setCompleteDataset(null); // Clear the complete dataset to force a full reload
    loadAllHistoricalData();
  };

  const toggleVolumeDisplay = () => {
    setShowVolume(prev => !prev);
  };
  
  const toggleDPODisplay = () => {
    setShowDPO(prev => !prev);
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
            <button
              className={`${styles.modernIconButton} ${styles.dpoToggle} ${showDPO ? styles.active : ''}`} 
              onClick={toggleDPODisplay}
              title={showDPO ? "Hide Advanced DPO" : "Show Advanced DPO"}
            >
              <FaChartLine />
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
              
              {/* Added Advanced DPO information */}
              <div className={styles.advancedDpoInfo}>
                <h4>Advanced DPO Indicator</h4>
                <p>The Advanced DPO (Detrended Price Oscillator) indicator helps determine whether a financial instrument is over or undervalued compared to its historical series.</p>
                <p><strong>How to interpret the indicator:</strong></p>
                <ul>
                  <li><span style={{ color: 'green', fontWeight: 'bold' }}>GREEN ZONE:</span> Strong Buy - Price is significantly undervalued</li>
                  <li><span style={{ color: '#0056a4', fontWeight: 'bold' }}>BLUE ZONE:</span> Hold - Price is fairly valued</li>
                  <li><span style={{ color: 'orange', fontWeight: 'bold' }}>ORANGE ZONE:</span> Sell - Price is becoming overvalued</li>
                  <li><span style={{ color: 'red', fontWeight: 'bold' }}>RED ZONE:</span> Strong Sell - Price is significantly overvalued</li>
                </ul>
                <p><strong>Investment Strategy:</strong> For best results, use this indicator in combination with seasonality analysis. When a financial instrument is in the Strong Buy or Buy zone and seasonality indicates a favorable period, the probability of a profitable trade increases significantly.</p>
              </div>
              
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
