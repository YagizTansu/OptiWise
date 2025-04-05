import { useState, useEffect } from 'react';
import { 
  fetchChartData, 
  ChartDataPoint 
} from '../../../services/api/finance';
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
  Filler,
  ChartOptions,
  ScaleOptionsByType,
  LineControllerChartOptions,
} from 'chart.js';
import { CircularProgress, TextField, Typography } from '@mui/material';
import styles from './seasonalityChart.module.css';

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

interface SeasonalityChartProps {
  symbol: string;
}

// Define the structure of our processed data
interface YearData {
  year: number;
  data: number[];
  dates: string[];
  rawData: ChartDataPoint[];
}

// Define time range option structure
interface TimeRangeOption {
  label: string;
  value: string;
  years?: number;
  color: string;
  isCustom?: boolean;
  isSpecificYear?: boolean;
  yearValue?: number;
}

const SeasonalityChart: React.FC<SeasonalityChartProps> = ({ symbol }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<ChartDataPoint[]>([]);
  const [processedData, setProcessedData] = useState<Record<number, YearData>>({});
  const [chartData, setChartData] = useState<any>(null);
  const [selectedRanges, setSelectedRanges] = useState<string[]>(['last5Years']);
  const [customStartYear, setCustomStartYear] = useState<string>('');
  const [customEndYear, setCustomEndYear] = useState<string>('');
  const [useAdjustedClose, setUseAdjustedClose] = useState<boolean>(true);
  const [smoothLine, setSmoothLine] = useState<boolean>(true);
  const [showVolatilityBand, setShowVolatilityBand] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>('USD');

  const timeRangeOptions: TimeRangeOption[] = [
    { label: 'Current Year', value: 'currentYear', color: 'rgba(54, 162, 235, 0.8)', isSpecificYear: true, yearValue: new Date().getFullYear() },
    { label: 'Past Year', value: 'pastYear', color: 'rgba(201, 203, 207, 0.8)', isSpecificYear: true, yearValue: new Date().getFullYear() - 1 },
    { label: '3 Years ', value: 'last3Years', years: 3, color: 'rgba(75, 192, 192, 0.6)' },
    { label: '5 Years ', value: 'last5Years', years: 5, color: 'rgba(153, 102, 255, 0.6)' },
    { label: '7 Years ', value: 'last7Years', years: 7, color: 'rgba(255, 99, 132, 0.6)' },
    { label: '10 Years', value: 'last10Years', years: 10, color: 'rgba(255, 159, 64, 0.6)' },
    { label: '15 Years', value: 'last15Years', years: 15, color: 'rgba(255, 205, 86, 0.6)' },
    { label: '20 Years', value: 'last20Years', years: 20, color: 'rgba(54, 162, 235, 0.6)' },
  ];

  useEffect(() => {
    if (symbol) {
      loadData();
    }
  }, [symbol]);

  useEffect(() => {
    if (Object.keys(processedData).length > 0) {
      generateChartData();
    }
  }, [processedData, selectedRanges, useAdjustedClose, smoothLine, showVolatilityBand, customStartYear, customEndYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get data for the last 10 years (or more if needed)
      const currentYear = new Date().getFullYear();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(currentYear - 10); // Get 10 years of data
      
      // Format dates for API
      const period1 = startDate.toISOString();
      const period2 = endDate.toISOString();
      
      // Fetch daily data
      const data = await fetchChartData(symbol, period1, period2, '1d');
      setRawData(data);
      
      // Store currency
      if (data.length > 0 && data[0].currency) {
        setCurrency(data[0].currency);
      }
      
      // Process the raw data
      const yearData = processDataByYear(data);
      setProcessedData(yearData);
      
    } catch (err) {
      setError(`Error loading data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error fetching seasonality chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processDataByYear = (data: ChartDataPoint[]): Record<number, YearData> => {
    const yearData: Record<number, YearData> = {};
    
    // Group data by year
    data.forEach(point => {
      const date = point.fullDate;
      const year = date.getFullYear();
      
      if (!yearData[year]) {
        yearData[year] = {
          year,
          data: [],
          dates: [],
          rawData: []
        };
      }
      
      yearData[year].rawData.push(point);
    });
    
    // For each year, calculate cumulative % change from the start of the year
    Object.keys(yearData).forEach(yearStr => {
      const year = parseInt(yearStr);
      const yearPoints = yearData[year].rawData;
      
      // Sort by date
      yearPoints.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
      
      // Find the first trading day of the year (may not be January 1st)
      const firstDayData = yearPoints[0];
      if (!firstDayData) return;
      
      const startPrice = firstDayData.close;
      
      // Calculate cumulative change for each day
      yearData[year].data = yearPoints.map(point => {
        const price = point.close;
        return ((price - startPrice) / startPrice) * 100;
      });
      
      // Store formatted dates for x-axis
      yearData[year].dates = yearPoints.map(point => {
        const date = point.fullDate;
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
      });
    });
    
    return yearData;
  };

  const calculateAveragePerformance = (years: number[]): { avgData: number[], dates: string[], stdDeviation: number[] } => {
    // Get the maximum number of trading days in any year to align data
    let maxDays = 0;
    const alignedData: number[][] = [];
    let commonDates: string[] = [];
    
    // Find all valid years and their trading day count
    const validYears = years.filter(year => 
      processedData[year] && processedData[year].data.length > 0
    );
    
    if (validYears.length === 0) {
      return { avgData: [], dates: [], stdDeviation: [] };
    }
    
    // Find the year with the most complete data to use as reference for dates
    let referenceYear = validYears[0];
    validYears.forEach(year => {
      const daysCount = processedData[year].data.length;
      if (daysCount > maxDays) {
        maxDays = daysCount;
        referenceYear = year;
      }
    });
    
    // Use the dates from the reference year
    commonDates = [...processedData[referenceYear].dates];
    
    // For each year, align the data to have the same length
    validYears.forEach(year => {
      const yearData = processedData[year].data;
      if (yearData.length > 0) {
        // If current year has fewer days than max, pad with the last value
        const paddedData = [...yearData];
        while (paddedData.length < maxDays) {
          paddedData.push(paddedData[paddedData.length - 1] || 0);
        }
        alignedData.push(paddedData.slice(0, maxDays));
      }
    });
    
    // Calculate average for each day across all years
    const avgData: number[] = [];
    const stdDeviation: number[] = [];
    
    for (let i = 0; i < maxDays; i++) {
      const dayValues = alignedData.map(yearData => yearData[i] || 0);
      const sum = dayValues.reduce((acc, val) => acc + val, 0);
      const avg = sum / dayValues.length;
      avgData.push(avg);
      
      // Calculate standard deviation
      if (dayValues.length > 1) {
        const squareDiffs = dayValues.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / squareDiffs.length;
        stdDeviation.push(Math.sqrt(avgSquareDiff));
      } else {
        stdDeviation.push(0);
      }
    }
    
    return { avgData, dates: commonDates, stdDeviation };
  };

  const generateChartData = () => {
    interface ChartDataset {
      label: string;
      data: number[];
      fill: boolean | string;
      borderColor: string;
      tension?: number;
      borderWidth?: number;
      pointRadius?: number;
      pointHoverRadius?: number;
      spanGaps?: boolean;
      borderDash?: number[];
    }
    
    const datasets: ChartDataset[] = [];
    const currentYear = new Date().getFullYear();
    const today = new Date();
    
    // Create a full year reference dataset for X-axis labels
    let fullYearDates: string[] = [];
    const years = Object.keys(processedData).map(Number).sort((a, b) => b - a);
    
    // Find a year with complete data to use as reference
    let referenceYear = years.find(year => {
      // Prioritize using past complete years over the current year
      return year < currentYear && processedData[year]?.dates?.length >= 250;
    }) || years[0];
    
    if (processedData[referenceYear]) {
      fullYearDates = [...processedData[referenceYear].dates];
    }
    
    // Process each selected time range
    selectedRanges.forEach(rangeValue => {
      const rangeOption = timeRangeOptions.find(option => option.value === rangeValue);
      if (!rangeOption) return;
      
      // Handle specific year selections (current year, past year)
      if (rangeOption.isSpecificYear && rangeOption.yearValue) {
        const year = rangeOption.yearValue;
        const yearData = processedData[year];
        
        if (yearData && yearData.data.length > 0) {
          // For current year, only show data up to the current date
          if (year === currentYear) {
            const currentDayOfYear = Math.floor(
              (today.getTime() - new Date(currentYear, 0, 1).getTime()) / (24 * 60 * 60 * 1000)
            );
            
            // Get data only up to today
            const filteredData = yearData.data.slice(0, yearData.data.findIndex((_, idx) => 
              idx >= yearData.dates.length || idx > currentDayOfYear
            ) || yearData.data.length);
            
            datasets.push({
              label: rangeOption.label,
              data: filteredData,
              fill: false,
              borderColor: rangeOption.color,
              tension: smoothLine ? 0.4 : 0,
              borderWidth: 2,
              pointRadius: 0, // Remove points
              pointHoverRadius: 0, // Remove hover points
              // Set this to ensure alignment with other years on the x-axis
              spanGaps: true,
            });
          } else {
            // Past years show complete data
            datasets.push({
              label: rangeOption.label,
              data: yearData.data,
              fill: false,
              borderColor: rangeOption.color,
              tension: smoothLine ? 0.4 : 0,
              borderWidth: 2,
              pointRadius: 0, // Remove points
              pointHoverRadius: 0, // Remove hover points
            });
          }
        }
        return;
      }
      
      // Handle average calculations for multi-year ranges
      if (rangeOption.years) {
        const yearsToInclude = Array.from({ length: rangeOption.years }, (_, i) => 
          currentYear - 1 - i
        );
        
        const { avgData, dates, stdDeviation } = calculateAveragePerformance(yearsToInclude);
        
        if (avgData.length > 0) {
          datasets.push({
            label: rangeOption.label,
            data: avgData,
            fill: false,
            borderColor: rangeOption.color,
            tension: smoothLine ? 0.4 : 0,
            borderWidth: 2,
            pointRadius: 0, // Remove points
            pointHoverRadius: 0, // Remove hover points
          });
          
          // Add volatility bands if requested
          if (showVolatilityBand) {
            datasets.push({
              label: `${rangeOption.label} +σ`,
              data: avgData.map((val, idx) => val + stdDeviation[idx]),
              fill: false,
              borderColor: rangeOption.color,
              borderWidth: 1,
              borderDash: [5, 5],
              pointRadius: 0,
              pointHoverRadius: 0,
            });
            
            datasets.push({
              label: `${rangeOption.label} -σ`,
              data: avgData.map((val, idx) => val - stdDeviation[idx]),
              fill: false,
              borderColor: rangeOption.color,
              borderWidth: 1,
              borderDash: [5, 5],
              pointRadius: 0,
              pointHoverRadius: 0,
            });
          }
        }
      }
      
      // Handle custom range
      if (rangeOption.isCustom) {
        const startYear = parseInt(customStartYear);
        const endYear = parseInt(customEndYear);
        
        if (!isNaN(startYear) && !isNaN(endYear) && startYear <= endYear) {
          const yearsToInclude = Array.from(
            { length: endYear - startYear + 1 }, 
            (_, i) => startYear + i
          );
          
          const { avgData, dates, stdDeviation } = calculateAveragePerformance(yearsToInclude);
          
          if (avgData.length > 0) {
            datasets.push({
              label: `${startYear} - ${endYear} Average`,
              data: avgData,
              fill: false,
              borderColor: rangeOption.color,
              tension: smoothLine ? 0.4 : 0,
              borderWidth: 2,
              pointRadius: 0, // Remove points
              pointHoverRadius: 0, // Remove hover points
            });
            
            // Add volatility bands if requested
            if (showVolatilityBand) {
              datasets.push({
                label: `${startYear} - ${endYear} +σ`,
                data: avgData.map((val, idx) => val + stdDeviation[idx]),
                fill: false,
                borderColor: rangeOption.color,
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 0,
              });
              
              datasets.push({
                label: `${startYear} - ${endYear} -σ`,
                data: avgData.map((val, idx) => val - stdDeviation[idx]),
                fill: false,
                borderColor: rangeOption.color,
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 0,
              });
            }
          }
        }
      }
    });
    
    // Use full year dates for the x-axis
    if (datasets.length > 0) {
      setChartData({
        labels: fullYearDates,
        datasets
      });
    } else {
      setChartData(null);
    }
  };

  // Calculate dynamic y-axis min and max values based on the data
  const calculateYAxisRange = () => {
    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
      return { min: -5, max: 5 }; // Default fallback values
    }

    // Extract all data points from all datasets
    const allValues: number[] = [];
    chartData.datasets.forEach((dataset: any) => {
      if (dataset.data) {
        allValues.push(...dataset.data.filter((val: any) => typeof val === 'number'));
      }
    });

    if (allValues.length === 0) {
      return { min: -5, max: 5 }; // Default fallback values
    }

    // Find min and max values
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Add padding (10% of the range) for better visualization
    const range = maxValue - minValue;
    const padding = range * 0.03;
    return {
      min: Math.floor((minValue - padding) * 10) / 10, // Round down to first decimal
      max: Math.ceil((maxValue + padding) * 10) / 10,  // Round up to first decimal
    };
  };

  // Get dynamic y-axis range
  const yAxisRange = calculateYAxisRange();

  // Format the y-axis ticks to include % symbol and properly type the chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: yAxisRange.min,
        max: yAxisRange.max,
        ticks: {
          // Fix the callback signature to match Chart.js's expected types
          callback: function(tickValue: string | number, index: number, ticks: any): string {
            // Convert string values to numbers if needed
            const numValue = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            // Format the value with one decimal place and add % symbol
            return `${numValue.toFixed(1)}%`;
          },
        },
        title: {
          display: false,
          text: 'Year-to-Date Cumulative % Change'
        }
      },
      x: {
        title: {
          display: false,
          text: 'Month'
        },
        ticks: {
          autoSkip: false,
          maxTicksLimit: 12,
          callback: function(value: any, index: number, values: any) {
            if (!chartData || !chartData.labels || index >= chartData.labels.length) {
              return '';
            }
            
            const label = chartData.labels[index];
            if (!label || typeof label !== 'string' || !label.includes(' ')) {
              return '';
            }
            
            const parts = label.split(' ');
            const month = parts[0]; // Extract month name
            
            // Show the first occurrence of each month
            if (index === 0) return month;
            
            // Check previous label
            if (index > 0 && chartData.labels[index - 1]) {
              const prevLabel = chartData.labels[index - 1];
              if (typeof prevLabel === 'string' && prevLabel.includes(' ')) {
                const prevMonth = prevLabel.split(' ')[0];
                if (month !== prevMonth) {
                  return month;  // Show label if it's a different month
                }
              }
            }
            
            return '';  // Hide label for other days
          }
        }
      }
    },
    plugins: {
      tooltip: {
        mode: 'index' as const, // Type assertion to fix the error
        intersect: false,
        position: 'nearest',
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      },
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: `${symbol} Seasonality Chart (${currency})`,
      }
    },
    interaction: {
      mode: 'index' as const, // Type assertion to fix the error
      intersect: false
    },
    hover: {
      mode: 'index' as const, // Type assertion to fix the error
      intersect: false
    }
  };

  const handleRangeChange = (rangeValue: string) => {
    setSelectedRanges(prev => {
      if (prev.includes(rangeValue)) {
        return prev.filter(r => r !== rangeValue);
      } else {
        return [...prev, rangeValue];
      }
    });
  };

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h6>Stock Seasonality Chart</h6>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </div>
      
      <div className={styles.chartControls}>
        {/* Time Range Selection - Minimal Inline Layout */}
        <div className={styles.timeRangeSelector}>
          <span className={styles.timeRangeLabel}>Select Time Ranges:</span>
          <div className={styles.timeRangeOptions}>
            {timeRangeOptions.map(option => (
              !option.isCustom && (
                <button
                  key={option.value}
                  className={`${styles.timeRangeButton} ${selectedRanges.includes(option.value) ? styles.active : ''}`}
                  onClick={() => handleRangeChange(option.value)}
                  disabled={loading}
                >
                  {option.label}
                </button>
              )
            ))}
          </div>
        </div>

        {/* Chart Options commented out */}
        {/* <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Chart Options:</span>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleButton} ${smoothLine ? styles.active : ''}`}
              onClick={() => setSmoothLine(!smoothLine)}
              disabled={loading}
            >
              Smooth Lines
            </button>
            <button
              className={`${styles.toggleButton} ${showVolatilityBand ? styles.active : ''}`}
              onClick={() => setShowVolatilityBand(!showVolatilityBand)}
              disabled={loading}
            >
              Show Volatility Bands
            </button>
            <button
              className={`${styles.toggleButton} ${useAdjustedClose ? styles.active : ''}`}
              onClick={() => setUseAdjustedClose(!useAdjustedClose)}
              disabled={loading}
            >
              Use Adjusted Close
            </button>
            <button 
              className={styles.refreshButton}
              onClick={loadData} 
              disabled={loading}
            >
              Refresh Data
            </button>
          </div>
        </div> */}
      </div>
      
      {/* Chart */}
      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.centeredContent}>
            <CircularProgress />
          </div>
        ) : chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className={styles.centeredContent}>
            <Typography className={styles.noDataMessage}>
              No data available. Select a different time range or symbol.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalityChart;
