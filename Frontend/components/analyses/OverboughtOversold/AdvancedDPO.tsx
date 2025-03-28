import React, { useEffect, useState } from 'react';
import { fetchChartData } from '../../../services/api/finance';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import styles from './AdvancedDPO.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdvancedDPOProps {
  symbol: string;
}

const AdvancedDPO: React.FC<AdvancedDPOProps> = ({ symbol }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    const calculateAdvancedDPO = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current date and date 10 years ago
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 10);

        console.log("Fetching data from", startDate.toISOString(), "to", endDate.toISOString());

        // Fetch 10 years of daily data
        const historicalData = await fetchChartData(
          symbol,
          startDate.toISOString(),
          endDate.toISOString(),
          '1d'
        );

        if (historicalData.length === 0) {
          throw new Error('No historical data available');
        }

        // Log the date range we received to diagnose the issue
        const firstDate = new Date(historicalData[0].fullDate).toLocaleDateString();
        const lastDate = new Date(historicalData[historicalData.length - 1].fullDate).toLocaleDateString();
        console.log(`Received data from ${firstDate} to ${lastDate} (${historicalData.length} data points)`);

        // Extract prices and dates
        const prices = historicalData.map(point => point.close);
        const dates = historicalData.map(point => point.date);

        // Extract currency
        if (historicalData[0]?.currency) {
          setCurrency(historicalData[0].currency);
        }

        // Calculate DPO (Detrended Price Oscillator)
        const period = 30;
        const lookback = Math.floor(period / 2) + 1;
        const dpoValues: number[] = [];
        const dpoLabels: string[] = [];

        // Calculate SMA for DPO
        for (let i = lookback; i < prices.length; i++) {
          let sum = 0;
          for (let j = 0; j < lookback; j++) {
            sum += prices[i - j];
          }
          const sma = sum / lookback;

          // DPO is the price shifted back (period/2) minus the SMA
          const shiftedIndex = i - Math.floor(period / 2);
          if (shiftedIndex >= 0) {
            const dpo = prices[shiftedIndex] - sma;
            dpoValues.push(dpo);
            dpoLabels.push(dates[shiftedIndex]);
          }
        }

        // Normalize DPO based on historical range
        const minDPO = Math.min(...dpoValues);
        const maxDPO = Math.max(...dpoValues);
        const range = maxDPO - minDPO;

        const normalizedDPO = dpoValues.map(value =>
          ((value - minDPO) / range) * 200 - 100 // Scale to -100 to 100 range
        );

        // Calculate 200-period Bollinger Bands
        const bollingerPeriod = Math.min(200, normalizedDPO.length);
        const bollingerBands1SD: number[] = [];
        const bollingerBands2SD: number[] = [];

        for (let i = bollingerPeriod - 1; i < normalizedDPO.length; i++) {
          let sum = 0;
          for (let j = 0; j < bollingerPeriod; j++) {
            sum += normalizedDPO[i - j];
          }
          const sma = sum / bollingerPeriod;

          let squaredDiffs = 0;
          for (let j = 0; j < bollingerPeriod; j++) {
            squaredDiffs += Math.pow(normalizedDPO[i - j] - sma, 2);
          }
          const stdDev = Math.sqrt(squaredDiffs / bollingerPeriod);

          bollingerBands1SD.push(sma + stdDev);
          bollingerBands2SD.push(sma + 2 * stdDev);
        }

        const upperBand1SD = bollingerBands1SD[bollingerBands1SD.length - 1];
        const upperBand2SD = bollingerBands2SD[bollingerBands2SD.length - 1];

        const displayCount = Math.min(normalizedDPO.length, 200); // Show more data points
        const displayStartIdx = normalizedDPO.length - displayCount;

        const displayLabels = dpoLabels.slice(displayStartIdx);
        const displayDPO = normalizedDPO.slice(displayStartIdx);

        const upperBand2SDLine = Array(displayCount).fill(upperBand2SD);
        const upperBand1SDLine = Array(displayCount).fill(upperBand1SD);
        const zeroLine = Array(displayCount).fill(0);

        const chartDataObj = {
          labels: displayLabels,
          datasets: [
            {
              label: 'Advanced DPO',
              data: displayDPO,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 2,
              tension: 0.1,
              pointRadius: 1,
              pointHoverRadius: 5,
              fill: false,
            },
            {
              label: 'Strong Sell Zone (Upper 2SD)',
              data: upperBand2SDLine,
              borderColor: 'rgba(255, 0, 0, 0.5)',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [5, 5],
              fill: false,
            },
            {
              label: 'Sell Zone (Upper 1SD)',
              data: upperBand1SDLine,
              borderColor: 'rgba(255, 165, 0, 0.5)',
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [5, 5],
              fill: false,
            },
            {
              label: 'Buy Zone',
              data: zeroLine,
              borderColor: 'rgba(0, 0, 255, 0.5)',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              borderDash: [5, 5],
              fill: false,
            }
          ]
        };

        setChartData(chartDataObj);
        setLoading(false);
      } catch (err) {
        console.error('Error calculating Advanced DPO:', err);
        setError('Failed to calculate Advanced DPO indicator');
        setLoading(false);
      }
    };

    calculateAdvancedDPO();
  }, [symbol]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 10,
        cornerRadius: 4,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      },
      title: {
        display: true,
        text: 'Forecaster Advanced DPO',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 12,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: (context: any) => {
            const value = context.tick.value;
            if (value > chartData?.datasets[1]?.data[0]) {
              return 'rgba(255, 0, 0, 0.2)'; // Red zone - increased opacity
            } else if (value > chartData?.datasets[2]?.data[0]) {
              return 'rgba(255, 165, 0, 0.2)'; // Orange zone - increased opacity
            } else if (value > chartData?.datasets[3]?.data[0]) {
              return 'rgba(0, 0, 255, 0.2)'; // Blue zone - increased opacity
            } else {
              return 'rgba(0, 255, 0, 0.2)'; // Green zone - increased opacity
            }
          },
          lineWidth: 1.5
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value: any) {
            return value;
          }
        },
        min: -100,
        max: 100
      }
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 6
      },
      line: {
        borderWidth: 2
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading Advanced DPO data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3 className={styles.errorTitle}>Advanced DPO Error</h3>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Advanced DPO <span className={styles.symbol}>{symbol}</span>
        </h3>
      </div>
      
      <div className={styles.legendContainer}>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.strongBuy}`}></span>
            <span className={styles.legendLabel}>Strong Buy</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.hold}`}></span>
            <span className={styles.legendLabel}>Hold</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.sell}`}></span>
            <span className={styles.legendLabel}>Sell</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendColor} ${styles.strongSell}`}></span>
            <span className={styles.legendLabel}>Strong Sell</span>
          </div>
        </div>
      </div>
      
      <div className={styles.chartContainer}>
        {chartData && <Line data={chartData} options={chartOptions} />}
      </div>
      
      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          <span className={styles.infoTitle}>How to use:</span> 
          The Advanced DPO indicator helps identify if an asset is over or undervalued compared to its historical price. 
          For best results, use in combination with seasonality analysis.
        </p>
        <div className={styles.currencyBox}>
          <span className={styles.infoTitle}>Currency:</span> 
          <span className={styles.currencyTag}>{currency}</span>
        </div>
        {chartData && (
          <div className={styles.currencyBox} style={{marginTop: '0.5rem'}}>
            <span className={styles.infoTitle}>Date Range:</span> 
            <span className={styles.currencyTag}>
              {chartData.labels[0]} - {chartData.labels[chartData.labels.length - 1]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedDPO;
