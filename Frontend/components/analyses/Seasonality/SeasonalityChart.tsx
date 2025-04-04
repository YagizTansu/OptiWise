import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { fetchChartData, ChartDataPoint } from '../../../services/api/finance';

// Register Chart.js components
Chart.register(...registerables);
 
// Define time range options
const TIME_RANGE_OPTIONS = [
  { value: '3y', label: '3 Years Average', years: 3 },
  { value: '5y', label: '5 Years Average', years: 5 },
  { value: '7y', label: '7 Years Average', years: 7 },
  { value: '10y', label: '10 Years Average', years: 10 },
  { value: 'pastYear', label: 'Past Year' },
  { value: 'currentYear', label: 'Current Year' }
];

// Colors for different time ranges
const CHART_COLORS = [
  'rgba(75, 192, 192, 1)',   // Teal
  'rgba(255, 99, 132, 1)',    // Pink
  'rgba(255, 206, 86, 1)',    // Yellow
  'rgba(54, 162, 235, 1)',    // Blue
  'rgba(153, 102, 255, 1)',   // Purple
  'rgba(255, 159, 64, 1)',    // Orange
];

// Month names for x-axis labels and organization
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Number of days in each month (non-leap year)
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

interface SeasonalityChartProps {
  symbol: string;
}

const SeasonalityChart: React.FC<SeasonalityChartProps> = ({ symbol }) => {
  const [selectedRanges, setSelectedRanges] = useState<string[]>(['3y', 'currentYear']);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('USD');

  // Main useEffect to fetch and process data when selections change
  useEffect(() => {
    fetchSeasonalityData();
  }, [symbol, selectedRanges]);

  // Handle checkbox change for time range selection
  const handleCheckboxChange = (value: string) => {
    setSelectedRanges(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Function to fetch and process seasonality data
  const fetchSeasonalityData = async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const datasets = [];
      
      // Process each selected time range
      for (const rangeType of selectedRanges) {
        const rangeData = await fetchRangeData(rangeType);
        if (rangeData) {
          datasets.push(rangeData);
        }
      }

      // Generate day of year labels for x-axis (day number within each month)
      const labels = generateDayLabels();

      // Prepare final chart data
      setChartData({
        labels,
        datasets
      });
    } catch (err) {
      console.error('Error fetching seasonality data:', err);
      setError('Failed to load seasonality data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate labels for each day of year in format "Jan 1", "Jan 2", etc.
  const generateDayLabels = (): string[] => {
    const labels: string[] = [];
    let dayOfYear = 1;
    
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= DAYS_IN_MONTH[month]; day++) {
        // Use day number as label for simplicity, Chart.js will handle display
        labels.push(`${day}`);
        dayOfYear++;
      }
    }
    
    return labels;
  };

  // Fetch data for a specific time range
  const fetchRangeData = async (rangeType: string): Promise<any> => {
    // Current date for calculations
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    let startDate: Date, endDate: Date, label: string;
    const option = TIME_RANGE_OPTIONS.find(opt => opt.value === rangeType);
    if (!option) return null;
    
    label = option.label;
    
    switch (rangeType) {
      case 'currentYear':
        // From Jan 1st current year to today
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, currentMonth, currentDay);
        break;
      case 'pastYear':
        // Full previous calendar year
        startDate = new Date(currentYear - 1, 0, 1);
        endDate = new Date(currentYear - 1, 11, 31);
        break;
      case '3y':
      case '5y':
      case '7y':
      case '10y':
        // Calculate years for the average
        const years = option.years || 3;
        // Start 'years' ago from Jan 1
        startDate = new Date(currentYear - years, 0, 1);
        // End at Dec 31 of last year
        endDate = new Date(currentYear - 1, 11, 31);
        break;
      default:
        return null;
    }

    // Format dates for API
    const period1 = startDate.toISOString();
    const period2 = endDate.toISOString();
    
    // Fetch chart data
    try {
      const rawData = await fetchChartData(symbol, period1, period2, '1d');
      
      // Update currency from data if available
      if (rawData.length > 0 && rawData[0].currency) {
        setCurrency(rawData[0].currency);
      }
      
      // Process the data based on range type
      if (rangeType.includes('y') && rangeType !== 'pastYear' && rangeType !== 'currentYear') {
        return processAveragedData(rawData, rangeType, label);
      } else {
        return processRawData(rawData, rangeType, label);
      }
    } catch (err) {
      console.error(`Error fetching data for ${rangeType}:`, err);
      return null;
    }
  };

  // Process data for averaged periods (3y, 5y, 7y, 10y)
  const processAveragedData = (data: ChartDataPoint[], rangeType: string, label: string): any => {
    // Create arrays to store sum and count for each day of the year (1-366)
    const dayOfYearSums: (number | null)[] = Array(366).fill(null);
    const dayOfYearCounts: number[] = Array(366).fill(0);
    
    // Track which years have data for each day
    const dayYearTracker: { [dayOfYear: number]: Set<number> } = {};
    for (let i = 0; i < 366; i++) {
      dayYearTracker[i] = new Set();
    }
    
    // Get the option with years information
    const option = TIME_RANGE_OPTIONS.find(opt => opt.value === rangeType);
    const requiredYears = option?.years || 0;
    
    // Get set of unique years in the data range
    const allYearsInData = new Set<number>();
    
    // Calculate the sum and count for each day of the year across all years
    data.forEach(point => {
      const date = point.fullDate;
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate() - 1;  // 0-based day index within month
      
      // Keep track of all years in dataset
      allYearsInData.add(year);
      
      // Calculate day of year index (0-based)
      let dayOfYearIndex = 0;
      for (let m = 0; m < month; m++) {
        dayOfYearIndex += DAYS_IN_MONTH[m];
      }
      dayOfYearIndex += day;
      
      if (point.close) {
        // Track which year this data point is from
        dayYearTracker[dayOfYearIndex].add(year);
        
        if (dayOfYearSums[dayOfYearIndex] === null) {
          dayOfYearSums[dayOfYearIndex] = 0;
        }
        dayOfYearSums[dayOfYearIndex] = (dayOfYearSums[dayOfYearIndex] as number) + point.close;
        dayOfYearCounts[dayOfYearIndex]++;
      }
    });
    
    // Calculate averages for each day of the year
    const dailyAverages: (number | null)[] = dayOfYearSums.map((sum, index) => {
      // Skip days with missing data
      if (sum === null || dayOfYearCounts[index] === 0) {
        return null;  // No data for this day
      }
      
      // Check if we have data for all required years
      const yearsWithDataForThisDay = dayYearTracker[index].size;
      const expectedYearsCount = requiredYears;
      
      // Only return a value if we have data from all expected years
      if (yearsWithDataForThisDay < expectedYearsCount) {
        return null; // Missing data for some years, create gap in chart
      }
      
      return sum / dayOfYearCounts[index];
    });
    
    // Count days with valid data (after filtering for complete year sets)
    const validDaysCount = dailyAverages.filter(value => value !== null).length;
    
    // Only return datasets with enough data points
    if (validDaysCount < 30) {  // Require at least 30 days of valid data
      return null;
    }
    
    // Get color index based on the position in TIME_RANGE_OPTIONS
    const colorIndex = TIME_RANGE_OPTIONS.findIndex(opt => opt.value === rangeType) % CHART_COLORS.length;
    
    return {
      label,
      data: dailyAverages,
      borderColor: CHART_COLORS[colorIndex],
      backgroundColor: CHART_COLORS[colorIndex].replace('1)', '0.2)'),
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      spanGaps: true
    };
  };

  // Process data for raw periods (Past Year, Current Year)
  const processRawData = (data: ChartDataPoint[], rangeType: string, label: string): any => {
    // Create array to store daily values for the year
    // Index 0 = January 1, Index 1 = January 2, etc.
    const dailyValues: (number | null)[] = Array(366).fill(null);
    
    // Map each data point to its day of year
    data.forEach(point => {
      const date = point.fullDate;
      const month = date.getMonth();
      const day = date.getDate() - 1;  // 0-based day index within month
      
      // Calculate day of year index (0-based)
      let dayOfYearIndex = 0;
      for (let m = 0; m < month; m++) {
        dayOfYearIndex += DAYS_IN_MONTH[m];
      }
      dayOfYearIndex += day;
      
      if (point.close) {
        dailyValues[dayOfYearIndex] = point.close;
      }
    });
    
    // Get color index based on the position in TIME_RANGE_OPTIONS
    const colorIndex = TIME_RANGE_OPTIONS.findIndex(opt => opt.value === rangeType) % CHART_COLORS.length;
    
    return {
      label,
      data: dailyValues,
      borderColor: CHART_COLORS[colorIndex],
      backgroundColor: CHART_COLORS[colorIndex].replace('1)', '0.2)'),
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      spanGaps: true
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: function(context: any[]) {
            if (context.length > 0) {
              const dataIndex = context[0].dataIndex;
              // Calculate month and day from index
              let dayCount = 0;
              let month = 0;
              
              // Find which month this index belongs to
              while (month < 12 && dayCount + DAYS_IN_MONTH[month] <= dataIndex) {
                dayCount += DAYS_IN_MONTH[month];
                month++;
              }
              
              const day = dataIndex - dayCount + 1;
              return `${SHORT_MONTH_NAMES[month]} ${day}`;
            }
            return '';
          },
          label: function(context: any) {
            const datasetLabel = context.dataset.label || '';
            const value = context.raw !== null ? context.raw.toFixed(2) : 'N/A';
            return `${datasetLabel}: ${value} ${currency}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of Year'
        },
        ticks: {
          callback: function(value: any, index: number) {
            // Only show ticks for the 1st of each month for cleaner x-axis
            let dayCount = 0;
            let month = 0;
            
            // Find which month this index belongs to
            while (month < 12 && dayCount + DAYS_IN_MONTH[month] <= index) {
              dayCount += DAYS_IN_MONTH[month];
              month++;
            }
            
            const day = index - dayCount + 1;
            
            if (day === 1) {
              return SHORT_MONTH_NAMES[month];
            }
            return '';
          },
          autoSkip: false,
          maxRotation: 0
        }
      },
      y: {
        title: {
          display: true,
          text: `Price (${currency})`
        },
        ticks: {
          callback: function(value: any) {
            return value.toFixed(2);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <div className="seasonality-chart-container card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Price Seasonality Chart</h4>
        <div className="range-selector" style={{ width: '50%' }}>
          <div className="mb-0">
            <div className="d-flex flex-wrap justify-content-end gap-2">
              {TIME_RANGE_OPTIONS.map(option => (
                <div key={option.value} className="form-check me-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`range-${option.value}`}
                    checked={selectedRanges.includes(option.value)}
                    onChange={() => handleCheckboxChange(option.value)}
                  />
                  <label className="form-check-label" htmlFor={`range-${option.value}`}>
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <div className="chart-area" style={{ height: '400px', position: 'relative' }}>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <div className="spinner">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-danger h-100 d-flex align-items-center justify-content-center">
              {error}
            </div>
          ) : chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="text-center text-muted h-100 d-flex align-items-center justify-content-center">
              No data available. Please select different time ranges.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonalityChart;
