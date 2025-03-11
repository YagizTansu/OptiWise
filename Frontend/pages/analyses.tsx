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


export default function Analyses() {
  const router = useRouter();
  const { symbol = '' } = router.query; // Default to AAPL if no symbol provided
  
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Layout>
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

          {/* Seasonality Tab - simplified props */}
          {activeTab === 'seasonality' && (
            <Seasonality symbol={symbol as string} />
          )}

          {/* COT Report Tab */}
          {activeTab === 'cot' && (
            <COTReport 
              symbol={symbol as string}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
