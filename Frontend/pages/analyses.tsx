import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout'
import styles from '../styles/Analyses.module.css';
import { FaRobot, FaChartLine, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Overview from '../components/analyses/Overview';
import Seasonality from '../components/analyses/Seasonality';
import COTReport from '../components/analyses/COTReport';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

// Sample data for charts and components that are not part of Overview
const trendData = {
  labels: Array.from({ length: 120 }, (_, i) => `${2015 + Math.floor(i/12)}-${(i % 12) + 1}`),
  datasets: [{
    label: 'Asset Price ($)',
    data: Array.from({ length: 120 }, () => Math.floor(Math.random() * 500) + 100),
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1,
    fill: false
  }]
};

const performancePeriods = [
  { label: '1M', value: -2.5, months: 1 },
  { label: '3M', value: 5.7, months: 3 },
  { label: '6M', value: 12.3, months: 6 },
  { label: '1Y', value: -8.2, months: 12 },
  { label: '3Y', value: 45.6, months: 36 },
  { label: '5Y', value: 78.2, months: 60 },
  { label: '10Y', value: 134.5, months: 120 },
  { label: '20Y', value: 267.8, months: 240 },
];

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

const monthlyAverageData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: '3 Years',
      data: [2.8, -1.3, 3.9, 4.2, 2.5, -3.1, 1.8, 3.6, 5.2, 3.7, -2.1, 4.5],
      backgroundColor: 'rgba(53, 162, 235, 0.7)',
    },
    {
      label: '5 Years',
      data: [1.9, -0.8, 4.7, 3.5, 2.0, -2.5, 1.2, 2.8, 4.1, 2.9, -1.5, 3.8],
      backgroundColor: 'rgba(255, 159, 64, 0.7)',
    }
  ]
};

// Sample COT data and other tab-specific state
const positionExtremesData = [
  {
    traderType: 'Large Speculators',
    highestLong: { value: '+126,789', date: 'May 2023', price: '$32,450' },
    highestShort: { value: '-42,567', date: 'Jan 2022', price: '$49,875' },
    currentPosition: { value: '+89,452', change: '+12.5%', direction: 'increasing' }
  },
  {
    traderType: 'Commercial Traders',
    highestLong: { value: '+58,921', date: 'Dec 2021', price: '$47,240' },
    highestShort: { value: '-137,456', date: 'May 2023', price: '$32,450' },
    currentPosition: { value: '-63,287', change: '-8.7%', direction: 'decreasing' }
  },
  {
    traderType: 'Small Speculators',
    highestLong: { value: '+24,567', date: 'Apr 2023', price: '$28,350' },
    highestShort: { value: '-19,876', date: 'Nov 2022', price: '$16,570' },
    currentPosition: { value: '+3,835', change: '+2.1%', direction: 'stable' }
  }
];

const sentimentData = [
  {
    traderCategory: 'Large Speculators',
    sentiment: 'bullish',
    netPosition: '+89,452',
    change: '+12.5%',
    longPercentage: '67%',
    description: 'Largest net long position in 6 months. Typically signals strong upward momentum.'
  },
  {
    traderCategory: 'Commercial Traders',
    sentiment: 'bearish',
    netPosition: '-63,287',
    change: '-8.7%',
    longPercentage: '42%',
    description: 'Increased short positions over past 3 weeks. Often hedge against market downturns.'
  },
  {
    traderCategory: 'Small Speculators',
    sentiment: 'neutral',
    netPosition: '+3,835',
    change: '+2.1%',
    longPercentage: '51%',
    description: 'Nearly balanced positions indicate uncertainty among retail traders.'
  },
  {
    traderCategory: 'Overall Market',
    sentiment: 'bullish',
    netPosition: '+30,000',
    change: '+5.4%',
    longPercentage: '56%',
    description: 'Divergence between trader categories suggests potential volatility ahead.'
  }
];

export default function Analyses() {
  const router = useRouter();
  const { symbol = 'AAPL' } = router.query; // Default to AAPL if no symbol provided
  
  const [activeTab, setActiveTab] = useState('overview');
  const [comparisonPeriods, setComparisonPeriods] = useState({ first: '3 Years', second: '5 Years' });
  const [activeTimeframe, setActiveTimeframe] = useState('monthly'); // New state for seasonality timeframe
  const [showDataPoints, setShowDataPoints] = useState(true); // Toggle data points
  const [viewMode, setViewMode] = useState('line'); // Toggle between line and bar chart

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

  // Generate correlation data visuals
  const correlationData = {
    labels: ['Correlation', 'No Correlation'],
    datasets: [
      {
        data: [50.06, 49.94],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(230, 230, 230, 0.5)'],
        borderWidth: 0,
        cutout: '75%'
      }
    ]
  };

  const correlation2Data = {
    labels: ['Correlation', 'No Correlation'],
    datasets: [
      {
        data: [38.98, 61.02],
        backgroundColor: ['rgba(255, 159, 64, 0.8)', 'rgba(230, 230, 230, 0.5)'],
        borderWidth: 0,
        cutout: '75%'
      }
    ]
  };

  return (
    <Layout>
      {/* Navigation bar - Same as in index.tsx */}

      <div className={styles.analysesContainer}>
        {/* Header with Asset Name and AI Button */}
        <div className={styles.header}>
          <h1 className={styles.assetName}>{symbol as string}</h1>
          <button className={styles.aiButton}>
            <FaRobot /> Forecast AI AGENT
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'seasonality' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('seasonality')}
          >
            <FaCalendarAlt /> Seasonality
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'cot' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('cot')}
          >
            <FaUsers /> COT Report
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Overview symbol={symbol as string} />
          )}

          {/* Seasonality Tab */}
          {activeTab === 'seasonality' && (
            <Seasonality
              assetInfo={{ name: symbol as string, symbol: symbol as string }}
              comparisonPeriods={comparisonPeriods}
              setComparisonPeriods={setComparisonPeriods}
              activeTimeframe={activeTimeframe}
              setActiveTimeframe={setActiveTimeframe}
              showDataPoints={showDataPoints}
              setShowDataPoints={setShowDataPoints}
              viewMode={viewMode}
              setViewMode={setViewMode}
              getCurrentSeasonalityData={getCurrentSeasonalityData}
              getChartTitle={getChartTitle}
              seasonalityChartOptions={seasonalityChartOptions}
              correlationData={correlationData}
              correlation2Data={correlation2Data}
              dailyAverageData={dailyAverageData}
              weeklyAverageData={weeklyAverageData}
              monthlyAverageData={monthlyAverageData}
            />
          )}

          {/* COT Report Tab */}
          {activeTab === 'cot' && (
            <COTReport 
              assetInfo={{ name: symbol as string, symbol: symbol as string }}
              positionExtremesData={positionExtremesData}
              sentimentData={sentimentData}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
