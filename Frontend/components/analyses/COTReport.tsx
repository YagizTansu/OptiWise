import { useState } from 'react';
import { FaInfoCircle, FaDownload, FaExpand, FaQuestion, FaArrowUp, FaArrowDown, 
  FaExchangeAlt, FaEye, FaHistory } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import styles from '../../styles/Analyses.module.css';

interface TraderPosition {
  traderType: string;
  highestLong: { value: string; date: string; price: string };
  highestShort: { value: string; date: string; price: string };
  currentPosition: { value: string; change: string; direction: string };
}

interface SentimentData {
  traderCategory: string;
  sentiment: string;
  netPosition: string;
  change: string;
  longPercentage: string;
  description: string;
}

// Moving data into the component
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

const sentimentData: SentimentData[] = [
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

// Simplified props interface
interface COTReportProps {
  symbol: string;
}

const COTReport: React.FC<COTReportProps> = ({ symbol }) => {
  // Internal state management
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [assetInfo, setAssetInfo] = useState<{ name: string; symbol: string }>({
    name: symbol,
    symbol: symbol
  });

  return (
    <div className={styles.cotTab}>
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
          <h2>Net Positions by Trader Category</h2>
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
        </div>
      </div>

      {/* Position Distribution */}
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <h2>Current Position Distribution</h2>
          <button className={styles.modernIconButton} title="Learn About Position Distribution">
            <FaInfoCircle />
          </button>
        </div>
        <div className={styles.correlationMetrics}>
          <div className={styles.compactCorrelationCard}>
            <h3>Large Speculators</h3>
            <div className={styles.correlationVisual}>
              <div className={styles.smallDonutContainer}>
                <Doughnut 
                  data={{
                    labels: ['Long', 'Short'],
                    datasets: [{
                      data: [67, 33],
                      backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                      borderWidth: 0
                    }]
                  }}
                  options={{
                    responsive: true,
                    cutout: '75%',
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: false }
                    }
                  }}
                  height={120}
                  width={120}
                />
                <div className={styles.correlationValueCompact}>67% Long</div>
              </div>
              <div className={styles.correlationDescription}>
                <div className={styles.positionDetails}>
                  <div className={styles.positionDetail}>
                    <span>Net Position:</span>
                    <span className={styles.positiveValue}>+89,452 contracts</span>
                  </div>
                  <div className={styles.positionDetail}>
                    <span>Change:</span>
                    <span className={styles.positiveValue}>+12.5%</span>
                  </div>
                </div>
                <p>Large speculators maintain a bullish stance with significant net long positions.</p>
              </div>
            </div>
          </div>
          
          <div className={styles.compactCorrelationCard}>
            <h3>Commercial Traders</h3>
            <div className={styles.correlationVisual}>
              <div className={styles.smallDonutContainer}>
                <Doughnut 
                  data={{
                    labels: ['Long', 'Short'],
                    datasets: [{
                      data: [42, 58],
                      backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                      borderWidth: 0,
                      
                    }]
                  }}
                  options={{
                    cutout: '75%',
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: false }
                    }
                  }}
                  height={120}
                  width={120}
                />
                <div className={styles.correlationValueCompact}>42% Long</div>
              </div>
              <div className={styles.correlationDescription}>
                <div className={styles.positionDetails}>
                  <div className={styles.positionDetail}>
                    <span>Net Position:</span>
                    <span className={styles.negativeValue}>-63,287 contracts</span>
                  </div>
                  <div className={styles.positionDetail}>
                    <span>Change:</span>
                    <span className={styles.negativeValue}>-8.7%</span>
                  </div>
                </div>
                <p>Commercial hedgers have increased short positions, often a sign of hedging against downside risk.</p>
              </div>
            </div>
          </div>
          
          <div className={styles.compactCorrelationCard}>
            <h3>Small Speculators</h3>
            <div className={styles.correlationVisual}>
              <div className={styles.smallDonutContainer}>
                <Doughnut 
                  data={{
                    labels: ['Long', 'Short'],
                    datasets: [{
                      data: [51, 49],
                      backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                      borderWidth: 0,
                      
                    }]
                  }}
                  options={{
                    cutout: '75%',
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: false }
                    }
                  }}
                  height={120}
                  width={120}
                />
                <div className={styles.correlationValueCompact}>51% Long</div>
              </div>
              <div className={styles.correlationDescription}>
                <div className={styles.positionDetails}>
                  <div className={styles.positionDetail}>
                    <span>Net Position:</span>
                    <span className={styles.positiveValue}>+3,835 contracts</span>
                  </div>
                  <div className={styles.positionDetail}>
                    <span>Change:</span>
                    <span className={styles.positiveValue}>+2.1%</span>
                  </div>
                </div>
                <p>Retail traders show nearly balanced positions with a slight bias toward longs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Analysis */}
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <h2>Historical Analysis</h2>
        </div>

        <div className={styles.historicalAnalysisGrid}>
          <div className={styles.analysisCard}>
            <div className={styles.cardHeader}>
              <h3>Position Extremes</h3>
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

      {/* Sentiment Analysis */}
      <div className={styles.overviewSection}>
        <div className={styles.sectionHeader}>
          <h2>Sentiment Analysis</h2>
          <button className={styles.modernIconButton} title="Latest Report: July 21, 2023">
            <FaHistory />
          </button>
        </div>

        <table className={styles.sentimentTable}>
          <thead>
            <tr>
              <th>Trader Category</th>
              <th>Sentiment</th>
              <th>Net Position</th>
              <th>Change</th>
              <th>Long %</th>
              <th>Analysis</th>
            </tr>
          </thead>
          <tbody>
            {sentimentData.map((row, index) => (
              <tr key={index}>
                <td><strong>{row.traderCategory}</strong></td>
                <td>
                  {row.sentiment === 'bullish' && (
                    <span className={`${styles.sentimentBadge} ${styles.bullishBadge}`}>
                      <FaArrowUp className={styles.badgeIcon} /> Bullish
                    </span>
                  )}
                  {row.sentiment === 'bearish' && (
                    <span className={`${styles.sentimentBadge} ${styles.bearishBadge}`}>
                      <FaArrowDown className={styles.badgeIcon} /> Bearish
                    </span>
                  )}
                  {row.sentiment === 'neutral' && (
                    <span className={`${styles.sentimentBadge} ${styles.neutralBadge}`}>
                      <FaExchangeAlt className={styles.badgeIcon} /> Neutral
                    </span>
                  )}
                </td>
                <td className={row.netPosition.startsWith('+') ? styles.positive : styles.negative}>
                  {row.netPosition}
                </td>
                <td className={row.change.startsWith('+') ? styles.positive : styles.negative}>
                  {row.change}
                </td>
                <td>{row.longPercentage}</td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strategy Insights */}
      <div className={styles.strategySuggestions}>
        <h2>Trading Insights</h2>
        <div className={styles.strategyCards}>
          <div className={styles.strategyCard}>
            <h3>Contrarian Signal</h3>
            <p>Commercial traders increasing short positions may indicate overextended price. Consider partial profit taking.</p>
            <button className={styles.modernPrimaryButton}>Explore Strategy</button>
          </div>
          <div className={styles.strategyCard}>
            <h3>Historical Pattern</h3>
            <p>Current positioning ratio between large speculators and commercials matches Feb 2021 rally pattern.</p>
            <button className={styles.modernPrimaryButton}>View Pattern</button>
          </div>
          <div className={styles.strategyCard}>
            <h3>AI Recommendation</h3>
            <p>Position divergence suggests near-term volatility. Consider options strategies to capitalize on price swings.</p>
            <button className={styles.modernPrimaryButton}>AI Analysis</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default COTReport;
