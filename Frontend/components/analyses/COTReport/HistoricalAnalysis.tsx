import React from 'react';
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaDownload, FaInfoCircle, FaEye } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';

interface TraderPosition {
  traderType: string;
  highestLong: { value: string; date: string; price: string };
  highestShort: { value: string; date: string; price: string };
  currentPosition: { value: string; change: string; direction: string };
}

// Position extremes data moved into this component
const positionExtremesData: TraderPosition[] = [
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

interface HistoricalAnalysisProps {
  symbol: string;
}

const HistoricalAnalysis: React.FC<HistoricalAnalysisProps> = ({ symbol }) => {
  return (
    <div className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <h2>Historical Analysis - {symbol}</h2>
      </div>

      <div className={styles.historicalAnalysisGrid}>
        <div className={styles.analysisCard}>
          <div className={styles.cardHeader}>
            <h3>Position Extremes for {symbol}</h3>
            <div className={styles.cardActions}>
              <button className={styles.modernIconButton}><FaDownload /></button>
              <button className={styles.modernIconButton}><FaInfoCircle /></button>
            </div>
          </div>
          <div className={styles.extremesTable}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Trader Type</th>
                  <th>Highest Net Long</th>
                  <th>Date / Price</th>
                  <th>Highest Net Short</th>
                  <th>Date / Price</th>
                  <th>Current Position</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {positionExtremesData.map((row, index) => (
                  <tr key={index}>
                    <td><strong>{row.traderType}</strong></td>
                    <td className={styles.positive}>{row.highestLong.value}</td>
                    <td>{row.highestLong.date} <br/><small>{row.highestLong.price}</small></td>
                    <td className={styles.negative}>{row.highestShort.value}</td>
                    <td>{row.highestShort.date} <br/><small>{row.highestShort.price}</small></td>
                    <td className={row.currentPosition.value.startsWith('+') ? styles.positive : styles.negative}>
                      {row.currentPosition.value}
                    </td>
                    <td>
                      {row.currentPosition.direction === 'increasing' && (
                        <span className={styles.positive}>
                          <span className={`${styles.trendIcon} ${styles.upTrend}`}><FaArrowUp /></span>
                          {row.currentPosition.change}
                        </span>
                      )}
                      {row.currentPosition.direction === 'decreasing' && (
                        <span className={styles.negative}>
                          <span className={`${styles.trendIcon} ${styles.downTrend}`}><FaArrowDown /></span>
                          {row.currentPosition.change}
                        </span>
                      )}
                      {row.currentPosition.direction === 'stable' && (
                        <span className={styles.neutral}>
                          <span className={`${styles.trendIcon} ${styles.neutralTrend}`}><FaExchangeAlt /></span>
                          {row.currentPosition.change}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.analysisCard}>
          <div className={styles.cardHeader}>
            <h3>Trading Activity</h3>
            <div className={styles.cardActions}>
              <button className={styles.modernIconButton}><FaEye /></button>
              <button className={styles.modernIconButton}><FaInfoCircle /></button>
            </div>
          </div>
          <div className={styles.compactBarChart}>
            <Bar 
              data={{
                labels: ['Large Speculators', 'Commercial Traders', 'Small Speculators'],
                datasets: [
                  {
                    label: 'Total Volume',
                    data: [372564, 598721, 124673],
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y' as const,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Contracts'
                    }
                  }
                }
              }}
              height={150}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalAnalysis;
