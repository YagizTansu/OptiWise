import { useRef, useEffect, useState } from 'react';
import styles from '../../../styles/OverboughtOversold/IndicatorChart.module.css';
import { FaInfoCircle, FaExpand, FaDownload, FaQuestion } from 'react-icons/fa';
import { Chart, ChartOptions, ChartData, registerables } from 'chart.js';
import { fetchWyckoffIndicatorData, WyckoffIndicatorData } from '../../../services/api/finance';

// Register ChartJS components
Chart.register(...registerables);

interface IndicatorChartProps {
  symbol: string;
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<WyckoffIndicatorData>({ labels: [], indicators: [] });
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
      const data = await fetchWyckoffIndicatorData(symbol, timeframe);
      if (!data || !data.labels || !data.indicators || data.labels.length === 0) {
        throw new Error('Invalid data format received');
      }
      setChartData(data);
    } catch (err) {
      console.error('Failed to load Wyckoff indicator data:', err);
      setError('Failed to load Wyckoff indicator data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const createIndicatorChart = (canvas: HTMLCanvasElement, data: WyckoffIndicatorData) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Determine min/max values dynamically with padding
    const values = [...data.indicators];
    const minVal = Math.min(...values) * 1.2;
    const maxVal = Math.max(...values) * 1.2;
    const dynamicMin = Math.min(-3, minVal);
    const dynamicMax = Math.max(3, maxVal);

    // Create overbought/oversold zones
    const overboughtLevel = 5;
    const oversoldLevel = -5;

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
            pointRadius: 1,
            pointHoverRadius: 5,
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
          },
          {
            label: 'Overbought Line',
            data: data.labels.map(() => overboughtLevel),
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 1,
            borderDash: [3, 3],
            tension: 0,
            fill: false,
            pointRadius: 0,
          },
          {
            label: 'Oversold Line',
            data: data.labels.map(() => oversoldLevel),
            borderColor: 'rgba(75, 192, 192, 0.5)',
            borderWidth: 1,
            borderDash: [3, 3],
            tension: 0,
            fill: false,
            pointRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: dynamicMin,
            max: dynamicMax,
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
            },
            title: {
              display: true,
              text: 'Indicator Value',
            },
          },
          x: {
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
            },
            title: {
              display: true,
              text: 'Time',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    });
  };

  const handleDownload = () => {
    if (indicatorChartRef.current) {
      const url = indicatorChartRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `wyckoff-indicator-${symbol}-${timeframe}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleFullscreen = () => {
    if (indicatorChartRef.current) {
      if (indicatorChartRef.current.requestFullscreen) {
        indicatorChartRef.current.requestFullscreen();
      }
    }
  };

  const toggleInfoDisplay = () => {
    setShowInfo(!showInfo);
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
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
          <button 
            className={styles.modernActionButton} 
            title="Download Chart"
            onClick={handleDownload}
          >
            <FaDownload className={styles.buttonIcon} /> 
            <span>Download</span>
          </button>
          <button 
            className={styles.modernActionButton} 
            title="Fullscreen"
            onClick={handleFullscreen}
          >
            <FaExpand className={styles.buttonIcon} /> 
            <span>Fullscreen</span>
          </button>
          <button 
            className={styles.modernIconButton} 
            onClick={toggleInfoDisplay}
            title="Show indicator information"
          >
            <FaQuestion />
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className={styles.modalBody}>
          <h3>Wyckoff Causes/Effects Indicator</h3>
          <p>
            The Wyckoff Causes/Effects indicator helps traders interpret charts according to Wyckoff's theory,
            which analyzes the relationship between price movements and transaction volume to predict future price directions.
          </p>
          <p><strong>Key Interpretations:</strong></p>
          <ul>
            <li><strong>Above +5:</strong> Strong markup phase, possibly overbought</li>
            <li><strong>Between 0 and +5:</strong> Accumulation or markup phase (bullish)</li>
            <li><strong>Between 0 and -5:</strong> Distribution or early markdown phase (bearish)</li>
            <li><strong>Below -5:</strong> Strong markdown phase, possibly oversold</li>
          </ul>
          <p><strong>Trend Confirmation & Divergence:</strong></p>
          <ul>
            <li>When indicator values follow the price trend: The trend is solid and likely to continue</li>
            <li>When indicator values diverge from price action: A potential trend reversal may be imminent</li>
          </ul>
          <p>This indicator combines momentum and volume analysis (supply and demand) to help identify the strength and sustainability of market trends.</p>
          <p className={styles.disclaimerText}>Disclaimer: This analysis is for informational purposes only and does not constitute investment advice.</p>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading Wyckoff indicator data...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button 
            className={styles.modernActionButton}
            onClick={() => loadChartData(timeframe)}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className={styles.chartContainer} style={{ height: '400px', position: 'relative' }}>
          <canvas ref={indicatorChartRef}></canvas>
        </div>
      )}
    </div>
  );
};

export default IndicatorChart;
