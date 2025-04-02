import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout'
import styles from '../styles/analysesGeneral.module.css';
import { FaRobot, FaChartLine, FaCalendarAlt, FaUsers, FaBalanceScale, FaChartPie, FaFileAlt, FaUserTie } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Overview from '../components/analyses/Overview/Overview';
import Seasonality from '../components/analyses/Seasonality/Seasonality';
import OverboughtOversold from '../components/analyses/OverboughtOversold/OverboughtOversold';
import Fundamental from '../components/analyses/fundamental/Fundamental';
import ForecastAI from '../components/analyses/forecastAi/ForecastAI';
import Report from '../components/analyses/Report/Report';
import Insiders from '../components/analyses/Insider/Insiders';
import ProtectedRoute from '@/components/ProtectedRoute';
import UpcomingEvents from '../components/UpcomingEvents';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);


export default function Analyses() {
  const router = useRouter();
  const { symbol = '' } = router.query; // Default to AAPL if no symbol provided
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if symbol is a futures contract
  const isFutures = typeof symbol === 'string' && symbol.includes('=F');

  const handleAIButtonClick = () => {
    setActiveTab('ai-forecast');
  };

  return (
    <ProtectedRoute>
    <Layout>
      <div className={styles.analysesContainer}>
        {/* Header with Asset Name and AI Button */}
        <div className={styles.header}>
        <h1 className={styles.assetName}>{symbol as string}</h1>
          {symbol && <UpcomingEvents symbol={symbol as string} />}

          <button className={styles.aiButton} onClick={handleAIButtonClick}>
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
            className={`${styles.tabButton} ${activeTab === 'overbought-oversold' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overbought-oversold')}
          >
            <FaBalanceScale /> Overbought/Oversold
          </button>
          
          {/* Only show these tabs if not a futures contract */}
          {!isFutures && (
            <>
              <button 
                className={`${styles.tabButton} ${activeTab === 'fundamental' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('fundamental')}
              >
                <FaChartPie /> Fundamental
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'insiders' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('insiders')}
              >
                <FaUserTie /> Insiders
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'report' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('report')}
              >
                <FaFileAlt /> Report
              </button>
            </>
          )}
          
          <button 
            className={`${styles.tabButton} ${activeTab === 'ai-forecast' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ai-forecast')}
          >
            <FaRobot /> AI Forecast
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Overview symbol={symbol as string} />
          )}

          {/* Seasonality Tab - simplified props */}
          {activeTab === 'seasonality' && (
            <Seasonality symbol={symbol as string} />
          )}

          {/* Overbought/Oversold Tab */}
          {activeTab === 'overbought-oversold' && (
            <OverboughtOversold 
              symbol={symbol as string}
            />
          )}
          
          {/* Fundamental Analysis Tab */}
          {!isFutures && activeTab === 'fundamental' && (
            <Fundamental 
              symbol={symbol as string}
            />
          )}

          {/* Insiders Tab */}
          {!isFutures && activeTab === 'insiders' && (
            <Insiders 
              symbol={symbol as string}
            />
          )}

          {/* Report Tab */}
          {!isFutures && activeTab === 'report' && (
            <Report 
              symbol={symbol as string}
            />
          )}

          {/* AI Forecast Tab */}
          {activeTab === 'ai-forecast' && (
            <ForecastAI 
              symbol={symbol as string}
            />
          )}
        </div>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}
