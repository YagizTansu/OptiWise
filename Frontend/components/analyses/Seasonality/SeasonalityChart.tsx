import React, { useState, useEffect } from 'react';
import { fetchChartData, ChartDataPoint } from '../../../services/api/finance';
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
  ChartOptions,
} from 'chart.js';
import Select from 'react-select';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SeasonalityChartProps {
  symbol: string;
}

interface PeriodOption {
  value: string;
  label: string;
  type: 'averaged' | 'raw';
  years?: number;
}

interface DayData {
  sum: number;
  count: number;
  values: number[];
}

interface ProcessedData {
  label: string;
  data: (number | null)[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  pointRadius: number;
  tension: number;
}

const SeasonalityChart: React.FC<SeasonalityChartProps> = ({ symbol }) => {
  const colorPalette = {
    '3years': '#4CAF50',  // green
    '5years': '#2196F3',  // blue
    '7years': '#9C27B0',  // purple
    '10years': '#FF9800', // orange
    'pastyear': '#F44336', // red
    'currentyear': '#009688', // teal
  };

  const [periodOptions] = useState<PeriodOption[]>([
    { value: '3years', label: '3 Years Average', type: 'averaged', years: 3 },
    { value: '5years', label: '5 Years Average', type: 'averaged', years: 5 },
    { value: '7years', label: '7 Years Average', type: 'averaged', years: 7 },
    { value: '10years', label: '10 Years Average', type: 'averaged', years: 10 },
    { value: 'pastyear', label: 'Past Year', type: 'raw' },
    { value: 'currentyear', label: 'Current Year', type: 'raw' },
  ]);
  
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodOption[]>([
    { value: '3years', label: '3 Years Average', type: 'averaged', years: 3 },
    { value: 'currentyear', label: 'Current Year', type: 'raw' },
  ]);
  
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: ProcessedData[];
  }>({
    labels: [],
    datasets: [],
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    if (!symbol || selectedPeriods.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    const fetchAllPeriodData = async () => {
      try {
        const today = new Date();
        const currentYear = today.getFullYear();
        const datasets: ProcessedData[] = [];
        
        // Process each selected period
        for (const period of selectedPeriods) {
          let dateRanges: { startDate: Date, endDate: Date }[] = [];
          
          if (period.type === 'averaged' && period.years) {
            // For averaged periods, we need to fetch data for each year separately
            for (let i = 0; i < period.years; i++) {
              const year = currentYear - i - 1; // Previous years (not including current)
              dateRanges.push({
                startDate: new Date(`${year}-01-01`),
                endDate: new Date(`${year}-12-31`)
              });
            }
          } else if (period.value === 'pastyear') {
            // Past full year
            const lastYear = currentYear - 1;
            dateRanges = [{
              startDate: new Date(`${lastYear}-01-01`),
              endDate: new Date(`${lastYear}-12-31`)
            }];
          } else if (period.value === 'currentyear') {
            // Current year to date
            dateRanges = [{
              startDate: new Date(`${currentYear}-01-01`),
              endDate: today
            }];
          }
          
          // Fetch data for all date ranges in this period
          const allDataForPeriod: ChartDataPoint[][] = [];
          
          for (const range of dateRanges) {
            try {
              const data = await fetchChartData(
                symbol,
                range.startDate.toISOString(),
                range.endDate.toISOString(),
                '1d'
              );
              
              // If this is first successful data fetch, store currency
              if (data.length > 0 && data[0].currency) {
                setCurrency(data[0].currency);
              }
              
              allDataForPeriod.push(data);
            } catch (err) {
              console.error(`Error fetching data for range ${range.startDate} - ${range.endDate}:`, err);
              // Continue with other ranges even if one fails
            }
          }
          
          // Process the data according to period type
          if (period.type === 'averaged' && allDataForPeriod.length > 0) {
            datasets.push(processAveragedData(allDataForPeriod, period));
          } else if (allDataForPeriod.length === 1) {
            datasets.push(processRawData(allDataForPeriod[0], period));
          }
        }
        
        // Generate labels and update chart data
        const labels = generateDailyLabels();
        
        setChartData({
          labels,
          datasets,
        });
      } catch (err) {
        setError(`Failed to fetch seasonality data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('Error fetching seasonality data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllPeriodData();
  }, [symbol, selectedPeriods]);

  // Process averaged data across multiple years
  const processAveragedData = (dataSets: ChartDataPoint[][], period: PeriodOption): ProcessedData => {
    // Group data by month and day (ignoring year)
    const dailyData: Record<string, DayData> = {};
    
    // Process all datasets (each representing a year)
    dataSets.forEach(yearData => {
      yearData.forEach(point => {
        const date = point.fullDate;
        const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        if (!dailyData[monthDay]) {
          dailyData[monthDay] = { sum: 0, count: 0, values: [] };
        }
        
        dailyData[monthDay].sum += point.close;
        dailyData[monthDay].count += 1;
        dailyData[monthDay].values.push(point.close);
      });
    });
    
    // Map to the full year of daily values
    const values: (number | null)[] = new Array(366).fill(null);
    
    // Helper to get day of year from month-day string
    const getDayOfYear = (monthDayStr: string): number => {
      const [month, day] = monthDayStr.split('-').map(Number);
      const date = new Date(2020, month - 1, day); // Using leap year 2020
      return getDayNumber(date.getMonth(), date.getDate());
    };
    
    // Calculate average for each day and put in correct position
    Object.entries(dailyData).forEach(([monthDay, data]) => {
      // Only include if we have data for all requested years
      if (period.years && data.count === period.years) {
        const dayOfYear = getDayOfYear(monthDay);
        values[dayOfYear] = data.sum / data.count;
      }
    });
    
    // Get color for this period
    const color = colorPalette[period.value as keyof typeof colorPalette] || '#777777';
    
    return {
      label: period.label,
      data: values,
      borderColor: color,
      backgroundColor: `${color}33`, // 20% opacity
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.2
    };
  };
  
  // Process raw data for a single year
  const processRawData = (data: ChartDataPoint[], period: PeriodOption): ProcessedData => {
    // Create array for all days in a year (0-indexed)
    const values: (number | null)[] = new Array(366).fill(null);
    
    // Process all data points
    data.forEach(point => {
      const date = point.fullDate;
      const dayOfYear = getDayNumber(date.getMonth(), date.getDate());
      values[dayOfYear] = point.close;
    });
    
    // Get color for this period
    const color = colorPalette[period.value as keyof typeof colorPalette] || '#777777';
    
    return {
      label: period.label,
      data: values,
      borderColor: color,
      backgroundColor: `${color}33`, // 20% opacity
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1
    };
  };

  // Helper to get day number (0-365) from month and day
  const getDayNumber = (month: number, day: number): number => {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Using leap year
    let dayOfYear = day - 1; // 0-indexed
    
    for (let i = 0; i < month; i++) {
      dayOfYear += daysInMonth[i];
    }
    
    return dayOfYear;
  };
  
  // Function to generate daily labels for a full year
  const generateDailyLabels = (): string[] => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Using leap year
    
    const labels: string[] = [];
    
    monthNames.forEach((month, idx) => {
      for (let day = 1; day <= daysInMonth[idx]; day++) {
        labels.push(`${month} ${day.toString().padStart(2, '0')}`);
      }
    });
    
    return labels;
  };
  
  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value !== null ? value.toFixed(2) : 'N/A'} ${currency}`;
          }
        }
      },
      title: {
        display: true,
        text: `Seasonality Chart for ${symbol}`,
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          callback: function(value, index) {
            // Only show month names
            const label = this.getLabelForValue(index as number);
            if (label.endsWith('01')) {
              return label.split(' ')[0]; // Return only month name for the 1st of each month
            }
            return ''; 
          }
        },
        grid: {
          display: true,
          drawOnChartArea: true,
          drawTicks: true,
          color: (context) => {
            // Highlight the first day of each month
            const label = context.tick?.label || '';
            return label.endsWith('01') ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)';
          }
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: currency
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
      axis: 'x'
    }
  };
  
  // Handle period selection change
  const handlePeriodChange = (selectedOptions: any) => {
    setSelectedPeriods(selectedOptions || []);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Seasonality Chart</h2>
      
      <div className="mb-4">
        <Select
          isMulti
          name="periods"
          options={periodOptions}
          value={selectedPeriods}
          onChange={handlePeriodChange}
          className="period-selector"
          placeholder="Select time periods..."
          closeMenuOnSelect={false}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-gray-50">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ height: '500px' }}>
          <Line options={options} data={chartData} />
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Note:</strong> For averaged periods, gaps in lines indicate dates where data isn't available for all years.</p>
      </div>
    </div>
  );
};

export default SeasonalityChart;
