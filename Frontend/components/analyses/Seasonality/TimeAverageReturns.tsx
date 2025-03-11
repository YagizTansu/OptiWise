import { FaExpand, FaInfoCircle } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import styles from '../../../styles/Analyses.module.css';

interface TimeAverageReturnsProps {
  symbol: string;
}

// Data structure for API responses
interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

interface ReturnData {
  period: string;
  avgReturn: number;
  stdDev: number;
  winRate: number;
  best: number;
  worst: number;
}

const TimeAverageReturns: React.FC<TimeAverageReturnsProps> = ({ symbol }) => {
  // Internal state management
  const [selectedPeriod, setSelectedPeriod] = useState('5 Years');
  const [selectedView, setSelectedView] = useState('monthly');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<ReturnData[]>([]);
  
  // Calculate date ranges based on selected period
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case '1 Year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '3 Years':
        startDate.setFullYear(endDate.getFullYear() - 3);
        break;
      case '5 Years':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      case '10 Years':
        startDate.setFullYear(endDate.getFullYear() - 10);
        break;
      case 'Max':
        startDate.setFullYear(2000); // Arbitrary start date for "Max"
        break;
      default:
        startDate.setFullYear(endDate.getFullYear() - 5);
    }
    
    return {
      from: startDate.toISOString().split('T')[0],
      to: endDate.toISOString().split('T')[0]
    };
  };
  
  // Get the appropriate API interval based on selected view
  const getInterval = () => {
    switch (selectedView) {
      case 'daily':
        return '1d';
      case 'monthly':
        return '1mo';
      case 'yearly':
        return '1mo'; // We'll aggregate to yearly in the frontend
      default:
        return '1mo';
    }
  };
  
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const dateRange = getDateRange();
    const interval = getInterval();
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/finance/historical?symbol=${symbol}&from=${dateRange.from}&to=${dateRange.to}&interval=${interval}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      
      const data = await response.json();
      processData(data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Process the data based on selected view
  const processData = (data: HistoricalData[]) => {
    if (!data || data.length === 0) {
      setError('No data available for the selected criteria');
      return;
    }
    
    let processedData;
    let statsResults: ReturnData[] = [];
    
    switch (selectedView) {
      case 'daily':
        processedData = processDailyData(data);
        break;
      case 'monthly':
        processedData = processMonthlyData(data);
        break;
      case 'yearly':
        processedData = processYearlyData(data);
        break;
      default:
        processedData = processMonthlyData(data);
    }
    
    setChartData(processedData);
    setStatsData(calculateStats(data, selectedView));
  };
  
  // Process data for daily view (day of month)
  const processDailyData = (data: HistoricalData[]) => {
    // Group returns by day of month
    const dailyReturns: { [day: number]: number[] } = {};
    
    // Initialize all days
    for (let i = 1; i <= 31; i++) {
      dailyReturns[i] = [];
    }
    
    // Calculate daily returns and group by day of month
    for (let i = 1; i < data.length; i++) {
      const previousClose = data[i-1].close;
      const currentClose = data[i].close;
      const returnPct = ((currentClose - previousClose) / previousClose) * 100;
      
      const date = new Date(data[i].date);
      const dayOfMonth = date.getDate();
      
      dailyReturns[dayOfMonth].push(returnPct);
    }
    
    // Calculate average return for each day of month
    const labels = Array.from({length: 31}, (_, i) => (i + 1).toString());
    const averageReturns = labels.map((day) => {
      const dayNum = parseInt(day);
      const returns = dailyReturns[dayNum];
      return returns.length > 0 
        ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
        : 0;
    });
    
    return {
      labels,
      datasets: [
        {
          label: `${selectedPeriod} Average Returns`,
          data: averageReturns,
          backgroundColor: 'rgba(53, 162, 235, 0.7)',
        }
      ]
    };
  };
  
  // Process data for monthly view
  const processMonthlyData = (data: HistoricalData[]) => {
    // Group returns by month
    const monthlyReturns: { [month: number]: number[] } = {};
    
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      monthlyReturns[i] = [];
    }
    
    // Calculate monthly returns
    for (let i = 1; i < data.length; i++) {
      const previousClose = data[i-1].close;
      const currentClose = data[i].close;
      const returnPct = ((currentClose - previousClose) / previousClose) * 100;
      
      const date = new Date(data[i].date);
      const month = date.getMonth();
      
      monthlyReturns[month].push(returnPct);
    }
    
    // Calculate average return for each month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const averageReturns = monthNames.map((_, idx) => {
      const returns = monthlyReturns[idx];
      return returns.length > 0 
        ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
        : 0;
    });
    
    return {
      labels: monthNames,
      datasets: [
        {
          label: `${selectedPeriod} Average Returns`,
          data: averageReturns,
          backgroundColor: 'rgba(53, 162, 235, 0.7)',
        }
      ]
    };
  };
  
  // Process data for yearly view
  const processYearlyData = (data: HistoricalData[]) => {
    // Group returns by year
    const yearlyReturns: { [year: number]: number[] } = {};
    
    // Calculate yearly returns
    for (let i = 1; i < data.length; i++) {
      const previousClose = data[i-1].close;
      const currentClose = data[i].close;
      const returnPct = ((currentClose - previousClose) / previousClose) * 100;
      
      const date = new Date(data[i].date);
      const year = date.getFullYear();
      
      if (!yearlyReturns[year]) {
        yearlyReturns[year] = [];
      }
      
      yearlyReturns[year].push(returnPct);
    }
    
    // Extract unique years and sort them
    const years = Object.keys(yearlyReturns).map(Number).sort();
    
    // Calculate average return for each year
    const averageReturns = years.map(year => {
      const returns = yearlyReturns[year];
      return returns.length > 0 
        ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
        : 0;
    });
    
    return {
      labels: years.map(String),
      datasets: [
        {
          label: `${selectedPeriod} Average Returns`,
          data: averageReturns,
          backgroundColor: 'rgba(53, 162, 235, 0.7)',
        }
      ]
    };
  };
  
  // Calculate statistics for the table
  const calculateStats = (data: HistoricalData[], viewType: string): ReturnData[] => {
    // This is a simplified implementation - adjust as needed
    const getPeriodName = (idx: number, type: string) => {
      if (type === 'monthly') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[idx];
      } else if (type === 'daily') {
        return `Day ${idx + 1}`;
      } else {
        return `${idx + 2010}`; // Example years starting from 2010
      }
    };
    
    // Generate some sample stats - replace with actual calculation in production
    return Array.from({length: viewType === 'monthly' ? 12 : (viewType === 'daily' ? 31 : 10)}, (_, i) => {
      const randomAvg = ((Math.random() * 5) - 2.5).toFixed(1);
      const randomStdDev = (Math.random() * 3).toFixed(1);
      const randomWinRate = Math.floor(Math.random() * 30 + 40);
      const randomBest = ((Math.random() * 8) + 1).toFixed(1);
      const randomWorst = ((Math.random() * 5) - 5).toFixed(1);
      
      return {
        period: getPeriodName(i, viewType),
        avgReturn: parseFloat(randomAvg),
        stdDev: parseFloat(randomStdDev),
        winRate: randomWinRate,
        best: parseFloat(randomBest),
        worst: parseFloat(randomWorst)
      };
    }).slice(0, viewType === 'monthly' ? 12 : (viewType === 'daily' ? 31 : 10));
  };
  
  // Fetch data when selectedPeriod or selectedView changes
  useEffect(() => {
    fetchData();
  }, [selectedPeriod, selectedView, symbol]);
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Average Returns for ${symbol}`,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Return %'
        }
      }
    }
  };

  return (
    <div className={styles.timeAverageReturnsSection}>
      <h2>Average Returns by Time Period</h2>
      
      <div className={styles.controls}>
        <div className={styles.controlsRow}>
          <div className={styles.controlGroup}>
            <label>Analysis Period:</label>
            <div className={styles.buttonGroup}>
              <button 
                className={selectedPeriod === '1 Year' ? styles.activeButton : styles.button}
                onClick={() => setSelectedPeriod('1 Year')}
              >
                1 Year
              </button>
              <button 
                className={selectedPeriod === '3 Years' ? styles.activeButton : styles.button}
                onClick={() => setSelectedPeriod('3 Years')}
              >
                3 Years
              </button>
              <button 
                className={selectedPeriod === '5 Years' ? styles.activeButton : styles.button}
                onClick={() => setSelectedPeriod('5 Years')}
              >
                5 Years
              </button>
              <button 
                className={selectedPeriod === '10 Years' ? styles.activeButton : styles.button}
                onClick={() => setSelectedPeriod('10 Years')}
              >
                10 Years
              </button>
              <button 
                className={selectedPeriod === 'Max' ? styles.activeButton : styles.button}
                onClick={() => setSelectedPeriod('Max')}
              >
                Max
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.controlsRow}>
          <div className={styles.controlGroup}>
            <label>View Mode:</label>
            <div className={styles.viewSelector}>
              <button 
                className={selectedView === 'daily' ? styles.activeView : styles.viewButton}
                onClick={() => setSelectedView('daily')}
              >
                Daily
              </button>
              <button 
                className={selectedView === 'monthly' ? styles.activeView : styles.viewButton}
                onClick={() => setSelectedView('monthly')}
              >
                Monthly
              </button>
              <button 
                className={selectedView === 'yearly' ? styles.activeView : styles.viewButton}
                onClick={() => setSelectedView('yearly')}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.returnsChart}>
        {loading && <p>Loading data...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && chartData && (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
      
    </div>
  );
};

export default TimeAverageReturns;
