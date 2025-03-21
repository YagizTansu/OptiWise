import { useRef, useEffect, useState } from 'react';
import styles from '../../../styles/Analyses.module.css';
import { FaInfoCircle, FaExpand, FaDownload,FaQuestion } from 'react-icons/fa';
import { Chart } from 'chart.js';
import { fetchWyckoffIndicatorData, WyckoffIndicatorData } from '../../../services/api/finance';

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
      setChartData(data);
    } catch (err) {
      console.error('Failed to load indicator data:', err);
      setError('Failed to load indicator data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const createIndicatorChart = (canvas: HTMLCanvasElement, data: WyckoffIndicatorData) => {
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
            <FaQuestion />
            
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className={styles.modalBody}>
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
