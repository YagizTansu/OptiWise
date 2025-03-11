import { FaChartLine, FaCircle, FaDownload, FaExpand, FaQuestion } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';

// Sample seasonality data
const monthlySeasonalityData = {
  labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  datasets: [
    {
      label: '3 Years',
      data: [5.2, 3.7, -2.1, 4.5, 2.8, -1.3, 3.9, 4.2, 2.5, -3.1, 1.8, 3.6],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
    {
      label: '5 Years',
      data: [4.1, 2.9, -1.5, 3.8, 1.9, -0.8, 4.7, 3.5, 2.0, -2.5, 1.2, 2.8],
      borderColor: 'rgb(255, 159, 64)',
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
    }
  ]
};

const dailyAverageData = {
  labels: Array.from({length: 31}, (_, i) => (i + 1).toString()),
  datasets: [
    {
      label: '3 Years',
      data: Array.from({length: 31}, () => (Math.random() * 30) - 15),
      backgroundColor: 'rgba(53, 162, 235, 0.7)',
    },
    {
      label: '5 Years',
      data: Array.from({length: 31}, () => (Math.random() * 30) - 15),
      backgroundColor: 'rgba(255, 159, 64, 0.7)',
    }
  ]
};

const weeklyAverageData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      label: '3 Years',
      data: [2.1, -1.4, 3.5, 1.8, -0.7],
      backgroundColor: 'rgba(53, 162, 235, 0.7)',
    },
    {
      label: '5 Years',
      data: [1.5, -0.9, 2.8, 1.2, -1.1],
      backgroundColor: 'rgba(255, 159, 64, 0.7)',
    }
  ]
};

interface SeasonalityAnalysisProps {
  comparisonPeriods: { first: string; second: string };
  setComparisonPeriods: (periods: { first: string; second: string }) => void;
  activeTimeframe: string;
  setActiveTimeframe: (timeframe: string) => void;
  showDataPoints: boolean;
  setShowDataPoints: (show: boolean) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
}

const SeasonalityAnalysis: React.FC<SeasonalityAnalysisProps> = ({
  comparisonPeriods,
  setComparisonPeriods,
  activeTimeframe,
  setActiveTimeframe,
  showDataPoints,
  setShowDataPoints,
  viewMode,
  setViewMode
}) => {
  // Chart options with data points toggle
  const seasonalityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: showDataPoints ? 4 : 0,
        hoverRadius: showDataPoints ? 6 : 0
      },
      line: {
        borderWidth: 2,
        tension: 0.3
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Percent Change (%)',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        }
      },
      x: {
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
        displayColors: true,
        usePointStyle: true
      },
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  // Function to get the current seasonality data based on the timeframe
  const getCurrentSeasonalityData = () => {
    switch(activeTimeframe) {
      case 'daily':
        return dailyAverageData;
      case 'weekly':
        return weeklyAverageData;
      case 'yearly':
        return {
          labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
          datasets: [
            {
              label: '3 Years',
              data: [12.5, -5.2, 34.7, 28.9, -15.3, 42.1],
              backgroundColor: 'rgba(53, 162, 235, 0.7)',
            },
            {
              label: '5 Years',
              data: [8.3, -3.1, 22.6, 18.5, -10.2, 31.7],
              backgroundColor: 'rgba(255, 159, 64, 0.7)',
            }
          ]
        };
      case 'monthly':
      default:
        return monthlySeasonalityData;
    }
  };

  // Get chart title based on timeframe
  const getChartTitle = () => {
    switch(activeTimeframe) {
      case 'daily':
        return 'Daily Seasonality';
      case 'weekly':
        return 'Weekly Seasonality';
      case 'yearly':
        return 'Yearly Seasonality';
      case 'monthly':
      default:
        return 'Monthly Seasonality';
    }
  };

  return (
    <>
      <div className={styles.seasonalityControls}>
        <div className={styles.viewControls}>
          <button 
            className={`${styles.modernButton} ${viewMode === 'line' ? styles.activeMod : ''}`}
            title="Line Chart View" 
            onClick={() => setViewMode('line')}
          >
            <FaChartLine className={styles.buttonIcon} /> 
            <span>Line</span>
          </button>
          <button 
            className={`${styles.modernButton} ${viewMode === 'bar' ? styles.activeMod : ''}`}
            title="Bar Chart View"
            onClick={() => setViewMode('bar')}
          >
            <FaChartLine className={styles.buttonIcon} /> 
            <span>Bar</span>
          </button>
          <button 
            className={`${styles.modernButton} ${showDataPoints ? styles.activeMod : ''}`}
            title="Toggle Data Points"
            onClick={() => setShowDataPoints(!showDataPoints)}
          >
            <FaCircle className={styles.buttonIcon} /> 
            <span>Points</span>
          </button>
        </div>
        
        <div className={styles.comparisonSelector}>
          <div className={styles.periodSelectorWrapper}>
            <label htmlFor="firstPeriod">Primary Period:</label>
            <select 
              id="firstPeriod"
              className={styles.periodSelect}
              value={comparisonPeriods.first}
              onChange={(e) => setComparisonPeriods({...comparisonPeriods, first: e.target.value})}
            >
              <option value="3 Years">3 Years</option>
              <option value="5 Years">5 Years</option>
              <option value="10 Years">10 Years</option>
            </select>
          </div>
          
          <div className={styles.vsIndicator}>vs</div>
          
          <div className={styles.periodSelectorWrapper}>
            <label htmlFor="secondPeriod">Compare With:</label>
            <select 
              id="secondPeriod"
              className={styles.periodSelect}
              value={comparisonPeriods.second}
              onChange={(e) => setComparisonPeriods({...comparisonPeriods, second: e.target.value})}
            >
              <option value="3 Years">3 Years</option>
              <option value="5 Years">5 Years</option>
              <option value="10 Years">10 Years</option>
            </select>
          </div>
        </div>
        
        <div className={styles.seasonalityTimeframeSelector}>
          <button 
            className={`${styles.modernTabButton} ${activeTimeframe === 'daily' ? styles.activeTab : ''}`}
            title="Daily View"
            onClick={() => setActiveTimeframe('daily')}
          >
            <span>Daily</span>
          </button>
          <button 
            className={`${styles.modernTabButton} ${activeTimeframe === 'weekly' ? styles.activeTab : ''}`}
            title="Weekly View"
            onClick={() => setActiveTimeframe('weekly')}
          >
            <span>Weekly</span>
          </button>
          <button 
            className={`${styles.modernTabButton} ${activeTimeframe === 'monthly' ? styles.activeTab : ''}`}
            title="Monthly View"
            onClick={() => setActiveTimeframe('monthly')}
          >
            <span>Monthly</span>
          </button>
          <button 
            className={`${styles.modernTabButton} ${activeTimeframe === 'yearly' ? styles.activeTab : ''}`}
            title="Yearly View"
            onClick={() => setActiveTimeframe('yearly')}
          >
            <span>Yearly</span>
          </button>
        </div>
      </div>

      {/* Primary Comparison Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>{getChartTitle()} Comparison</h2>
          <div className={styles.chartControls}>
            <button className={styles.modernActionButton} title="Download Chart">
              <FaDownload className={styles.buttonIcon} /> 
              <span>Download</span>
            </button>
            <button className={styles.modernActionButton} title="Fullscreen">
              <FaExpand className={styles.buttonIcon} /> 
              <span>Fullscreen</span>
            </button>
            <button className={styles.modernIconButton} title="Learn About Seasonality">
              <FaQuestion />
            </button>
          </div>
        </div>
        <div className={styles.comparisonChart}>
          {viewMode === 'line' ? (
            <Line 
              data={getCurrentSeasonalityData()}
              options={seasonalityChartOptions}
              height={300}
            />
          ) : (
            <Bar
              data={getCurrentSeasonalityData()}
              options={seasonalityChartOptions}
              height={300}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SeasonalityAnalysis;
