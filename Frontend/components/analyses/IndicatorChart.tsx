import { useRef, useEffect, useState } from 'react';
import styles from '../../styles/Analyses.module.css';
import { FaInfoCircle } from 'react-icons/fa';
import { Chart } from 'chart.js';

interface IndicatorChartProps {
  symbol: string;
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ symbol }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<{
    labels: string[];
    indicators: number[];
  }>({ labels: [], indicators: [] });
  const [timeframe, setTimeframe] = useState('1y');
  
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
    
    try {
      // Here you would fetch actual indicator data based on the symbol and timeframe
      // For now, we'll generate mock data
      const mockData = generateMockData(timeframe);
      setChartData(mockData);
    } catch (error) {
      console.error('Failed to load indicator data:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (timeframe: string) => {
    const dataPoints = timeframeToDataPoints(timeframe);
    const today = new Date();
    const labels = [];
    const indicators = [];

    // Generate time labels going back from today
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      // Generate indicator data (oscillating around zero)
      const indicatorBase = Math.sin(i / (dataPoints / 8)) * 10; // Oscillating between -10 and 10
      const indicatorRandomness = Math.random() * 2 - 1; // Random fluctuation of ±1
      indicators.push(indicatorBase + indicatorRandomness);
    }

    return { labels, indicators };
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

  const createIndicatorChart = (canvas: HTMLCanvasElement, data: any) => {
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
            borderColor: 'rgba(255, 99, 132, 1)',
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
          x: {
            ticks: {
              display: false // Hide x-axis labels as they're shown in the price chart
            }
          },
          y: {
            min: -15,
            max: 15,
            title: {
              display: true,
              text: 'Value'
            }
          }
        }
      }
    });
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.indicatorHeader}>
          <h3>Wyckoff Causes/Effects - {symbol}</h3>
          <div className={styles.indicatorTabs}>
            <button className={`${styles.modernTabButton} ${styles.activeTab}`}>
              Speed
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading indicator...</p>
        </div>
      ) : (
        <div className={styles.chartContainer} style={{ height: '200px' }}>
          <canvas ref={indicatorChartRef}></canvas>
        </div>
      )}

      <div className={styles.chartFooter}>
        <button className={styles.modernIconButton}>
          <FaInfoCircle />
        </button>
        <span className={styles.disclaimerText}>
          Disclaimer: This analysis is for informational purposes only and does not constitute investment advice.
        </span>
      </div>
    </div>
  );
};

export default IndicatorChart;
