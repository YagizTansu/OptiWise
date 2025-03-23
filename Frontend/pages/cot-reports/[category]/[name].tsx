import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FaArrowLeft, FaDownload, FaInfoCircle } from 'react-icons/fa';
import styles from '../../../styles/COTReportDetail.module.css';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';

// Mock data for the charts and data tables
const mockPositionData = {
  dates: ['2023-01-01', '2023-01-08', '2023-01-15', '2023-01-22', '2023-01-29', '2023-02-05', '2023-02-12'],
  commercial: [120000, 125000, 128000, 130000, 135000, 132000, 138000],
  nonCommercial: [80000, 85000, 82000, 79000, 83000, 88000, 90000],
  nonReportable: [25000, 24000, 26000, 29000, 27000, 26000, 25000],
};

export default function COTReportDetail() {
  const router = useRouter();
  const { category, name } = router.query;
  const [tabView, setTabView] = useState('positions');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  // Format category and name for display
  const formatCategoryName = (str: string | undefined) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1').trim();
  };

  // Simulate loading report data
  useEffect(() => {
    if (!category || !name) return;

    // Simulate API call to fetch report data
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Set mock data
      setReportData({
        name: decodeURIComponent(name as string),
        category: formatCategoryName(category as string),
        exchange: 'CME', // This would come from real data
        lastUpdated: new Date().toLocaleDateString(),
        positionData: mockPositionData,
        priceData: {
          current: 1.2345,
          change: 0.0123,
          changePercent: 1.01
        }
      });
      
      setIsLoading(false);
    };

    fetchData();
  }, [category, name]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className={styles.container}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading report data...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!reportData) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className={styles.container}>
            <div className={styles.errorContainer}>
              <h2>Report Not Found</h2>
              <p>The requested COT report could not be found.</p>
              <Link href="/cot-reports" className={styles.backLink}>
                <FaArrowLeft /> Back to COT Reports
              </Link>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className={styles.container}>
          <Head>
            <title>{reportData.name} COT Report | OptiWise</title>
            <meta name="description" content={`COT report for ${reportData.name}`} />
          </Head>

          <main className={styles.main}>
            <div className={styles.breadcrumbs}>
              <Link href="/cot-reports">
                COT Reports
              </Link>
              {' > '}
              <Link href={`/cot-reports?category=${category}`}>
                {reportData.category}
              </Link>
              {' > '}
              <span>{reportData.name}</span>
            </div>

            <div className={styles.reportHeader}>
              <div>
                <h1 className={styles.reportTitle}>{reportData.name}</h1>
                <div className={styles.reportMeta}>
                  <span>Exchange: {reportData.exchange}</span>
                  <span>Last updated: {reportData.lastUpdated}</span>
                </div>
              </div>
              
              <div className={styles.reportActions}>
                <button className={styles.downloadButton}>
                  <FaDownload /> Download Data
                </button>
              </div>
            </div>

            <div className={styles.tabs}>
              <button 
                className={`${styles.tabButton} ${tabView === 'positions' ? styles.activeTab : ''}`}
                onClick={() => setTabView('positions')}
              >
                Position Analysis
              </button>
              <button 
                className={`${styles.tabButton} ${tabView === 'trends' ? styles.activeTab : ''}`}
                onClick={() => setTabView('trends')}
              >
                Trend Analysis
              </button>
              <button 
                className={`${styles.tabButton} ${tabView === 'seasonal' ? styles.activeTab : ''}`}
                onClick={() => setTabView('seasonal')}
              >
                Seasonal Patterns
              </button>
              <button 
                className={`${styles.tabButton} ${tabView === 'history' ? styles.activeTab : ''}`}
                onClick={() => setTabView('history')}
              >
                Historical Data
              </button>
            </div>

            <div className={styles.chartSection}>
              <div className={styles.chartHeader}>
                <h2>Net Positions by Trader Category</h2>
                <div className={styles.infoTag}>
                  <FaInfoCircle className={styles.infoIcon} />
                  <span>Chart showing net positions held by different trader categories over time</span>
                </div>
              </div>
              <div className={styles.chartPlaceholder}>
                {/* This would be replaced with an actual chart component */}
                <div className={styles.mockChart}>
                  <div className={styles.mockChartLine} style={{ height: '60%', backgroundColor: '#4a90e2' }}></div>
                  <div className={styles.mockChartLine} style={{ height: '40%', backgroundColor: '#e2844a' }}></div>
                  <div className={styles.mockChartLine} style={{ height: '20%', backgroundColor: '#50e24a' }}></div>
                </div>
              </div>
            </div>

            <div className={styles.dataSection}>
              <div className={styles.dataHeader}>
                <h2>Position Data</h2>
              </div>
              <div className={styles.dataTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Commercial</th>
                      <th>Non-Commercial</th>
                      <th>Non-Reportable</th>
                      <th>Net Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.positionData.dates.map((date: string, index: number) => (
                      <tr key={index}>
                        <td>{date}</td>
                        <td>{reportData.positionData.commercial[index].toLocaleString()}</td>
                        <td>{reportData.positionData.nonCommercial[index].toLocaleString()}</td>
                        <td>{reportData.positionData.nonReportable[index].toLocaleString()}</td>
                        <td>
                          {(reportData.positionData.commercial[index] - 
                            reportData.positionData.nonCommercial[index]).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.insightsSection}>
              <h2>Market Insights</h2>
              <div className={styles.insightCards}>
                <div className={styles.insightCard}>
                  <h3>Commercial Positioning</h3>
                  <p>Commercial traders have been increasing their long positions over the past 4 weeks, suggesting a bullish outlook from industry participants.</p>
                </div>
                <div className={styles.insightCard}>
                  <h3>Speculative Interest</h3>
                  <p>Non-commercial positions show decreased speculative interest compared to historical averages, which may indicate a potential contrarian buying opportunity.</p>
                </div>
                <div className={styles.insightCard}>
                  <h3>Net Position Analysis</h3>
                  <p>Current commercial net position is at the 75th percentile of its 5-year range, suggesting strong bullish sentiment from industry insiders.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
