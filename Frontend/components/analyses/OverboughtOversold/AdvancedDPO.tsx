import React, { useEffect, useState, useRef } from 'react';
import { fetchChartData, ChartDataPoint } from '../../../services/api/finance';
import Chart from 'chart.js/auto';
import styles from './AdvancedDPO.module.css';
import { CircularProgress } from '@mui/material';
import { FaQuestion } from 'react-icons/fa';

interface AdvancedDPOProps {
  symbol: string;
}

// DPO calculation constants
const DPO_PERIOD = 20;
const BOLLINGER_PERIOD = 200;
const STD_DEV_1 = 1;
const STD_DEV_2 = 2;

const AdvancedDPO: React.FC<AdvancedDPOProps> = ({ symbol }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePeriod, setActivePeriod] = useState<string>('1y');
  const [showInfo, setShowInfo] = useState(false);
  const priceChartRef = useRef<HTMLCanvasElement>(null);
  const dpoChartRef = useRef<HTMLCanvasElement>(null);
  const priceChartInstance = useRef<Chart | null>(null);
  const dpoChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        let startDate = new Date();
        let displayStartDate = new Date();

        switch (activePeriod) {
          case '6m':
            displayStartDate.setMonth(endDate.getMonth() - 6);
            break;
          case '1y':
            displayStartDate.setFullYear(endDate.getFullYear() - 1);
            break;
          case '2y':
            displayStartDate.setFullYear(endDate.getFullYear() - 2);
            break;
          case '5y':
            displayStartDate.setFullYear(endDate.getFullYear() - 5);
            break;
          case '10y':
            displayStartDate.setFullYear(endDate.getFullYear() - 10);
            break;
          default:
            displayStartDate.setFullYear(endDate.getFullYear() - 1);
        }

        startDate = new Date(displayStartDate);
        startDate.setDate(startDate.getDate() - BOLLINGER_PERIOD);

        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(endDate.getFullYear() - 10);

        const data = await fetchChartData(
          symbol,
          startDate.toISOString(),
          endDate.toISOString(),
          '1d'
        );

        let tenYearData = data;
        if (activePeriod !== '10y') {
          tenYearData = await fetchChartData(
            symbol,
            tenYearsAgo.toISOString(),
            endDate.toISOString(),
            '1wk'
          );
        }

        setChartData(data);
        if (data.length > 0) {
          createCharts(data, tenYearData, displayStartDate);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (priceChartInstance.current) {
        priceChartInstance.current.destroy();
      }
      if (dpoChartInstance.current) {
        dpoChartInstance.current.destroy();
      }
    };
  }, [symbol, activePeriod]);

  const createCharts = (data: ChartDataPoint[], referenceData: ChartDataPoint[], displayStartDate: Date) => {
    if (!data.length || !priceChartRef.current || !dpoChartRef.current) return;

    const {
      dates,
      prices,
      volumes,
      dpoValues,
      upperBand1,
      lowerBand1,
      upperBand2,
      lowerBand2
    } = processAdvancedDPO(data, referenceData);

    const displayStartDateStr = displayStartDate.toISOString().split('T')[0];
    const displayStartIndex = data.findIndex(item => {
      const itemDate = new Date(item.date);
      return itemDate >= displayStartDate;
    });

    const displayDateIndex = displayStartIndex > 0 ? displayStartIndex : 0;
    const displayDates = dates.slice(displayDateIndex);
    const displayPrices = prices.slice(displayDateIndex);
    const displayVolumes = volumes.slice(displayDateIndex);
    const displayDpoValues = dpoValues.slice(displayDateIndex);
    const displayUpperBand1 = upperBand1.slice(displayDateIndex);
    const displayLowerBand1 = lowerBand1.slice(displayDateIndex);
    const displayUpperBand2 = upperBand2.slice(displayDateIndex);
    const displayLowerBand2 = lowerBand2.slice(displayDateIndex);

    if (priceChartRef.current) {
      if (priceChartInstance.current) {
        priceChartInstance.current.destroy();
      }

      const ctx = priceChartRef.current.getContext('2d');
      if (ctx) {
        const priceGradient = ctx.createLinearGradient(0, 0, 0, 400);
        priceGradient.addColorStop(0, 'rgba(33, 150, 243, 0.4)');
        priceGradient.addColorStop(1, 'rgba(33, 150, 243, 0.05)');

        const volumeGradient = ctx.createLinearGradient(0, 0, 0, 400);
        volumeGradient.addColorStop(0, 'rgba(76, 175, 80, 0.7)');
        volumeGradient.addColorStop(1, 'rgba(76, 175, 80, 0.2)');

        const minPrice = Math.min(...displayPrices);
        const maxPrice = Math.max(...displayPrices);

        priceChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: displayDates,
            datasets: [
              {
                type: 'line',
                label: 'Price',
                data: displayPrices,
                borderColor: '#2196f3',
                backgroundColor: priceGradient,
                yAxisID: 'y',
                fill: true,
                tension: 0.2,
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#2196f3',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
              },
              {
                type: 'bar',
                label: 'Volume',
                data: displayVolumes,
                backgroundColor: volumeGradient,
                yAxisID: 'y1',
                barPercentage: 0.95,
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
            animation: {
              duration: 1000,
              easing: 'easeOutQuart'
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: false,
                },
                ticks: {
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 10,
                  padding: 10,
                  font: {
                    size: 11,
                  }
                }
              },
              y: {
                position: 'left',
                display: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                  lineWidth: 1,
                },
                border: {
                  dash: [4, 4],
                },
                title: {
                  display: false,
                  text: 'Price',
                  font: {
                    size: 12,
                    weight: 'bold',
                  },
                  padding: { bottom: 10 }
                },
                ticks: {
                  padding: 8,
                  callback: function(value) {
                    return value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                  }
                }
              },
              y1: {
                position: 'right',
                display: true,
                grid: {
                  drawOnChartArea: false,
                },
                border: {
                  dash: [4, 4],
                },
                title: {
                  display: false,
                  text: 'Volume',
                  font: {
                    size: 12,
                    weight: 'bold',
                  },
                  padding: { bottom: 10 }
                },
                ticks: {
                  padding: 8,
                  callback: function(value): string | number {
                    if (value >= 1000000000) {
                      return (value / 1000000000).toFixed(1) + 'B';
                    }
                    if (value >= 1000000) {
                      return (value / 1000000).toFixed(1) + 'M';
                    }
                    if (value >= 1000) {
                      return (value / 1000).toFixed(1) + 'K';
                    }
                    return value;
                  }
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  boxWidth: 8,
                  boxHeight: 8,
                }
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                borderColor: 'rgba(200, 200, 200, 0.75)',
                borderWidth: 1,
                callbacks: {
                  title: function(tooltipItems) {
                    return tooltipItems[0].label;
                  },
                  label: function(context) {
                    let label = context.dataset.label || '';
                    let value = Number(context.raw);

                    if (label === 'Price') {
                      return `${label}: ${value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}`;
                    } else if (label === 'Volume') {
                      if (Number(value) >= 1000000000) {
                        return `${label}: ${(value / 1000000000).toFixed(2)}B`;
                      }
                      if (value >= 1000000) {
                        return `${label}: ${(value / 1000000).toFixed(2)}M`;
                      }
                      if (value >= 1000) {
                        return `${label}: ${(value / 1000).toFixed(2)}K`;
                      }
                      return `${label}: ${value}`;
                    }
                    return `${label}: ${value}`;
                  }
                }
              }
            }
          }
        });
      }
    }

    if (dpoChartRef.current) {
      if (dpoChartInstance.current) {
        dpoChartInstance.current.destroy();
      }

      const ctx = dpoChartRef.current.getContext('2d');
      if (ctx) {
        const dpoGradient = ctx.createLinearGradient(0, 0, 0, 300);
        dpoGradient.addColorStop(0, 'rgba(103, 58, 183, 0.3)');
        dpoGradient.addColorStop(1, 'rgba(103, 58, 183, 0.05)');

        dpoChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: displayDates,
            datasets: [
              {
                label: 'Advanced DPO',
                data: displayDpoValues,
                borderColor: '#673ab7',
                backgroundColor: dpoGradient,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#673ab7',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                fill: true,
                tension: 0.3
              },
              {
                label: 'Upper Band (1σ)',
                data: displayUpperBand1,
                borderColor: 'rgba(255, 152, 0, 0.8)',
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                borderDash: [4, 4]
              },
              {
                label: 'Lower Band (1σ)',
                data: displayLowerBand1,
                borderColor: 'rgba(33, 150, 243, 0.8)',
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                borderDash: [4, 4]
              },
              {
                label: 'Upper Band (2σ)',
                data: displayUpperBand2,
                borderColor: 'rgba(244, 67, 54, 0.8)',
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                borderDash: [4, 4]
              },
              {
                label: 'Lower Band (2σ)',
                data: displayLowerBand2,
                borderColor: 'rgba(76, 175, 80, 0.8)',
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                borderDash: [4, 4]
              },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            animation: {
              duration: 1000,
              easing: 'easeOutQuart'
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: false,
                },
                ticks: {
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 10,
                  padding: 10,
                  font: {
                    size: 11,
                  }
                }
              },
              y: {
                display: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                  lineWidth: 1,
                },
                border: {
                  dash: [4, 4],
                },
                title: {
                  display: true,
                  text: 'DPO Value',
                  font: {
                    size: 12,
                    weight: 'bold',
                  },
                  padding: { bottom: 10 }
                },
                ticks: {
                  padding: 8
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  boxWidth: 8,
                  boxHeight: 8,
                }
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#333',
                bodyColor: '#666',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                borderColor: 'rgba(200, 200, 200, 0.75)',
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    const value = context.raw as number;
                    let signal = '';
                    let signalColor = '';

                    if (value > displayUpperBand2[context.dataIndex as number]) {
                      signal = '📉 Strong Sell';
                      signalColor = '#f44336';
                    } else if (value > displayUpperBand1[context.dataIndex as number]) {
                      signal = '⚠️ Sell';
                      signalColor = '#ff9800';
                    } else if (value < displayLowerBand2[context.dataIndex as number]) {
                      signal = '🔥 Strong Buy';
                      signalColor = '#4caf50';
                    } else if (value < displayLowerBand1[context.dataIndex as number]) {
                      signal = '✅ Buy';
                      signalColor = '#2196f3';
                    } else {
                      signal = '🔄 Hold';
                      signalColor = '#9e9e9e';
                    }

                    const dataset = context.dataset.label || '';
                    if (dataset === 'Advanced DPO') {
                      return [
                        `Value: ${value.toFixed(2)}`,
                        `Signal: ${signal}`
                      ];
                    }
                    return `${dataset}: ${value.toFixed(2)}`;
                  }
                }
              }
            }
          }
        });
      }
    }
  };

  const processAdvancedDPO = (data: ChartDataPoint[], referenceData: ChartDataPoint[]) => {
    const dates: string[] = [];
    const prices: number[] = [];
    const volumes: number[] = [];
    const closePrices = data.map(item => item.close);

    data.forEach(item => {
      dates.push(item.date);
      prices.push(item.close);
      volumes.push(item.volume || 0);
    });

    const allPrices = referenceData.map(item => item.close);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;

    const dpoValues: number[] = [];
    const sma: number[] = calculateSMA(closePrices, DPO_PERIOD);

    for (let i = 0; i < closePrices.length; i++) {
      const lookbackIndex = i - Math.floor(DPO_PERIOD / 2 + 1);
      if (lookbackIndex >= 0 && lookbackIndex < sma.length) {
        const dpo = closePrices[i] - sma[lookbackIndex];
        const normalizedDpo = (dpo / priceRange) * 100;
        dpoValues.push(normalizedDpo);
      } else {
        dpoValues.push(0);
      }
    }

    const {
      sma: dpoSMA,
      upperBand1,
      lowerBand1,
      upperBand2,
      lowerBand2
    } = calculateBollingerBands(dpoValues, BOLLINGER_PERIOD, STD_DEV_1, STD_DEV_2);

    return {
      dates,
      prices,
      volumes,
      dpoValues,
      dpoSMA,
      upperBand1,
      lowerBand1,
      upperBand2,
      lowerBand2
    };
  };

  const calculateSMA = (data: number[], period: number): number[] => {
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(0);
        continue;
      }

      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }

      result.push(sum / period);
    }

    return result;
  };

  const calculateBollingerBands = (data: number[], period: number, stdDev1: number, stdDev2: number) => {
    const sma = calculateSMA(data, period);
    const upperBand1: number[] = [];
    const lowerBand1: number[] = [];
    const upperBand2: number[] = [];
    const lowerBand2: number[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upperBand1.push(0);
        lowerBand1.push(0);
        upperBand2.push(0);
        lowerBand2.push(0);
        continue;
      }

      let sumSquaredDiff = 0;
      for (let j = 0; j < period; j++) {
        const diff = data[i - j] - sma[i];
        sumSquaredDiff += diff * diff;
      }
      const stdDevValue = Math.sqrt(sumSquaredDiff / period);

      upperBand1.push(sma[i] + stdDevValue * stdDev1);
      lowerBand1.push(sma[i] - stdDevValue * stdDev1);
      upperBand2.push(sma[i] + stdDevValue * stdDev2);
      lowerBand2.push(sma[i] - stdDevValue * stdDev2);
    }

    return { sma, upperBand1, lowerBand1, upperBand2, lowerBand2 };
  };

  const toggleInfoDisplay = () => {
    setShowInfo(!showInfo);
  };

  return (
    <>
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>Price/Volume chart - {symbol}</h2>
          <div className={styles.chartControls}>
            <div className={styles.periodSelector}>
              {['6m', '1y', '2y', '5y', '10y'].map(period => (
                <button
                  key={period}
                  className={`${styles.periodButton} ${activePeriod === period ? styles.periodButtonActive : ''}`}
                  onClick={() => setActivePeriod(period)}
                >
                  {period.toUpperCase()}
                </button>
              ))}
            </div>
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
          <div className={styles.helpContent}>
            <h3>About Advanced DPO Indicator</h3>
            <p>
              The proprietary indicator 'Forecaster Advanced DPO' allows you to tell, at a glance, whether a financial instrument is over or undervalued compared to its historical series. It combines the DPO indicator (Detrended Price Oscillator) with an algorithm that normalizes the DPO figure based on the 10-year price range.
            </p>

            <p><strong>How To Use This Indicator:</strong></p>
            <p>
              The Advanced DPO with Bollinger Bands creates four different zones that correspond to various market phases:
            </p>
            <ul>
              <li><strong>GREEN (Below Lower 2σ Band):</strong> Strong Buy - The asset is significantly undervalued.</li>
              <li><strong>BLUE (Between Lower 1σ and 2σ):</strong> Buy - The asset is moderately undervalued.</li>
              <li><strong>BLUE (Between Upper and Lower 1σ):</strong> Hold - The asset is fairly valued.</li>
              <li><strong>ORANGE (Between Upper 1σ and 2σ):</strong> Sell - The asset is moderately overvalued.</li>
              <li><strong>RED (Above Upper 2σ Band):</strong> Strong Sell - The asset is significantly overvalued.</li>
            </ul>

            <p><strong>Investing Strategy:</strong></p>
            <p>
              Although this indicator provides timely information, particularly regarding possible purchase points, it is always better to use it in synergy with seasonality analysis. If a financial instrument is in the Strong Buy or Buy zone and the seasonality signals a favorable period for purchase, the chances that the trading/investment operation will be profitable rise significantly.
            </p>
          </div>
        )}



        <div className={styles.chartContainer}>
          <canvas ref={priceChartRef} />
          {loading && (
            <div className={styles.loadingOverlay}>
              <CircularProgress />
            </div>
          )}
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>Advanced DPO Indicator - {symbol}</h2>
        </div>

        <div className={styles.indicatorContainer}>
          <canvas ref={dpoChartRef} />
          {loading && (
            <div className={styles.loadingOverlay}>
              <CircularProgress />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdvancedDPO;