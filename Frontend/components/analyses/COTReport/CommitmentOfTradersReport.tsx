import React from 'react';
import { FaInfoCircle, FaDownload, FaExpand, FaQuestion } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';

interface CommitmentOfTradersReportProps {
  assetInfo: {
    name: string;
    symbol: string;
  };
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  symbol: string; // Add symbol directly
}

const CommitmentOfTradersReport: React.FC<CommitmentOfTradersReportProps> = ({
  assetInfo,
  selectedPeriod,
  setSelectedPeriod,
  symbol
}) => {
  // We can use either symbol or assetInfo.symbol depending on requirements
  return (
    <>
      <div className={styles.seasonalityHeader}>
        <h1>Commitment of Traders (COT) Report for {assetInfo.name}</h1>
        <p className={styles.seasonalityDescription}>
          <FaInfoCircle className={styles.infoIcon} /> 
          The COT report shows the positions of different types of traders in the futures markets. 
          This analysis helps identify sentiment shifts among large institutional players, commercial hedgers, and retail traders.
        </p>
      </div>

      {/* Time Period Selection for COT data */}
      <div className={styles.periodSelectionBar}>
        <h2>Select Time Period</h2>
        <div className={styles.periodToggle}>
          {['3M', '6M', '1Y', '2Y', '5Y'].map((period) => (
            <button 
              key={period}
              className={`${styles.modernTabButton} ${period === selectedPeriod ? styles.activeTab : ''}`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Main COT Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2>Net Positions by Trader Category ({symbol})</h2>
          <div className={styles.chartControls}>
            <button className={styles.modernActionButton} title="Download Chart">
              <FaDownload className={styles.buttonIcon} /> 
              <span>Download</span>
            </button>
            <button className={styles.modernActionButton} title="Fullscreen">
              <FaExpand className={styles.buttonIcon} /> 
              <span>Fullscreen</span>
            </button>
            <button className={styles.modernIconButton} title="Learn More">
              <FaQuestion />
            </button>
          </div>
        </div>
        <div className={styles.trendChart}>
          <Line 
            data={{
              labels: Array.from({ length: 52 }, (_, i) => `Week ${i+1}`),
              datasets: [
                {
                  label: 'Large Speculators',
                  data: Array.from({ length: 52 }, () => Math.floor(Math.random() * 200000) - 100000),
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.3,
                  fill: false
                },
                {
                  label: 'Commercial Traders',
                  data: Array.from({ length: 52 }, () => Math.floor(Math.random() * 200000) - 100000),
                  borderColor: 'rgb(255, 99, 132)',
                  tension: 0.3,
                  fill: false
                },
                {
                  label: 'Small Speculators',
                  data: Array.from({ length: 52 }, () => Math.floor(Math.random() * 100000) - 50000),
                  borderColor: 'rgb(255, 205, 86)',
                  tension: 0.3,
                  fill: false
                }
              ]
            }} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              elements: {
                line: {
                  tension: 0.3
                },
                point: {
                  radius: 1,
                  hoverRadius: 5
                }
              },
              scales: {
                y: {
                  title: {
                    display: true,
                    text: 'Net Position (Contracts)',
                    font: {
                      size: 14,
                      weight: 'bold'
                    }
                  },
                  grid: {
                    color: 'rgba(200, 200, 200, 0.1)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    maxTicksLimit: 12
                  }
                }
              },
              plugins: {
                legend: {
                  position: 'top',
                  align: 'end',
                  labels: {
                    boxWidth: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  titleFont: {
                    size: 14,
                    weight: 'bold'
                  },
                  bodyFont: {
                    size: 13
                  }
                }
              }
            }}
            height={400}
          />
        </div>
        <div className={styles.chartSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Current Price:</span>
            <span className={styles.summaryValue}>$52,371.45</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Last Report Date:</span>
            <span className={styles.summaryValue}>July 21, 2023</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Asset:</span>
            <span className={styles.summaryValue}>{symbol}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommitmentOfTradersReport;
