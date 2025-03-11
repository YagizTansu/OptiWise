import { useState } from 'react';
import { FaInfoCircle, FaChartLine, FaCircle, FaDownload, FaExpand, FaQuestion } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import styles from '../../styles/Analyses.module.css';

interface SeasonalityProps {
  assetInfo: { name: string; symbol: string };
  comparisonPeriods: { first: string; second: string };
  setComparisonPeriods: (periods: { first: string; second: string }) => void;
  activeTimeframe: string;
  setActiveTimeframe: (timeframe: string) => void;
  showDataPoints: boolean;
  setShowDataPoints: (show: boolean) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  getCurrentSeasonalityData: () => any;
  getChartTitle: () => string;
  seasonalityChartOptions: any;
  correlationData: any;
  correlation2Data: any;
  dailyAverageData: any;
  weeklyAverageData: any;
  monthlyAverageData: any;
}

const Seasonality: React.FC<SeasonalityProps> = ({
  assetInfo,
  comparisonPeriods,
  setComparisonPeriods,
  activeTimeframe,
  setActiveTimeframe,
  showDataPoints,
  setShowDataPoints,
  viewMode,
  setViewMode,
  getCurrentSeasonalityData,
  getChartTitle,
  seasonalityChartOptions,
  correlationData,
  correlation2Data,
  dailyAverageData,
  weeklyAverageData,
  monthlyAverageData
}) => {
  return (
    <div className={styles.seasonalityTab}>
      <div className={styles.seasonalityHeader}>
        <h1>Seasonality Analysis for {assetInfo.name}</h1>
        <p className={styles.seasonalityDescription}>
          <FaInfoCircle className={styles.infoIcon} /> 
          Seasonality analysis helps identify recurring patterns in asset price movements during specific 
          time periods. Use this data to optimize your entry and exit points.
        </p>
      </div>
      
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

      {/* Correlation Data with improved visuals */}
      <div className={styles.correlationSection}>
        <div className={styles.sectionHeader}>
          <h2>Pattern Correlation</h2>
          <button className={styles.modernIconButton} title="Learn About Correlation">
            <FaQuestion />
          </button>
        </div>
        
        <div className={styles.correlationMetrics}>
          <div className={styles.compactCorrelationCard}>
            <h3>{comparisonPeriods.first} Correlation</h3>
            <div className={styles.correlationVisual}>
              <div className={styles.smallDonutContainer}>
                <Doughnut 
                  data={correlationData}
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
                <div className={styles.correlationValueCompact}>50.06%</div>
              </div>
              <div className={styles.correlationDescription}>
                <p>Medium correlation strength suggests moderate historical pattern consistency.</p>
              </div>
            </div>
          </div>
          
          <div className={styles.compactCorrelationCard}>
            <h3>{comparisonPeriods.second} Correlation</h3>
            <div className={styles.correlationVisual}>
              <div className={styles.smallDonutContainer}>
                <Doughnut 
                  data={correlation2Data}
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
                <div className={styles.correlationValueCompact}>38.98%</div>
              </div>
              <div className={styles.correlationDescription}>
                <p>Weak correlation indicates less reliable historical patterns over this period.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time-Based Analysis Cards */}
      <div className={styles.timeAnalysisSection}>
        <div className={styles.sectionHeader}>
          <h2>Average Returns by Time Period</h2>
          <div className={styles.periodToggle}>
            <button className={`${styles.modernTabButton} ${styles.active}`}>3 Years</button>
            <button className={styles.modernTabButton}>5 Years</button>
            <button className={styles.modernTabButton}>10 Years</button>
          </div>
        </div>
        
        <div className={styles.analysisCards}>
          {/* Daily Average Analysis */}
          <div className={styles.analysisCard}>
            <div className={styles.cardHeader}>
              <h3>Daily Average</h3>
              <div className={styles.cardActions}>
                <button className={styles.modernIconButton}><FaExpand /></button>
                <button className={styles.modernIconButton}><FaInfoCircle /></button>
              </div>
            </div>
            <div className={styles.averageChart}>
              <Bar 
                data={dailyAverageData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        boxWidth: 12,
                        usePointStyle: true
                      }
                    },
                  },
                  scales: {
                    y: {
                      min: -50,
                      max: 50,
                      title: {
                        display: true,
                        text: 'Percent (%)'
                      }
                    }
                  }
                }}
                height={180}
              />
            </div>
            <div className={styles.bestWorstDays}>
              <div className={styles.bestDay}>
                <span>Best: </span>Day 15 (+8.3%)
              </div>
              <div className={styles.worstDay}>
                <span>Worst: </span>Day 22 (-7.9%)
              </div>
            </div>
          </div>

          {/* Weekly Average Analysis */}
          <div className={styles.analysisCard}>
            <div className={styles.cardHeader}>
              <h3>Weekly Average</h3>
              <div className={styles.cardActions}>
                <button className={styles.modernIconButton}><FaExpand /></button>
                <button className={styles.modernIconButton}><FaInfoCircle /></button>
              </div>
            </div>
            <div className={styles.averageChart}>
              <Bar 
                data={weeklyAverageData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        boxWidth: 12,
                        usePointStyle: true
                      }
                    },
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Percent (%)'
                      }
                    }
                  }
                }}
                height={180}
              />
            </div>
            <div className={styles.bestWorstDays}>
              <div className={styles.bestDay}>
                <span>Best: </span>Wednesday (+3.5%)
              </div>
              <div className={styles.worstDay}>
                <span>Worst: </span>Tuesday (-1.4%)
              </div>
            </div>
          </div>

          {/* Monthly Average Analysis */}
          <div className={styles.analysisCard}>
            <div className={styles.cardHeader}>
              <h3>Monthly Average</h3>
              <div className={styles.cardActions}>
                <button className={styles.modernIconButton}><FaExpand /></button>
                <button className={styles.modernIconButton}><FaInfoCircle /></button>
              </div>
            </div>
            <div className={styles.averageChart}>
              <Bar 
                data={monthlyAverageData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        boxWidth: 12,
                        usePointStyle: true
                      }
                    },
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Percent (%)'
                      }
                    }
                  }
                }}
                height={180}
              />
            </div>
            <div className={styles.bestWorstDays}>
              <div className={styles.bestDay}>
                <span>Best: </span>September (+5.2%)
              </div>
              <div className={styles.worstDay}>
                <span>Worst: </span>November (-2.1%)
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Strategy Suggestions based on seasonality */}
      <div className={styles.strategySuggestions}>
        <h2>Strategic Insights</h2>
        <div className={styles.strategyCards}>
          <div className={styles.strategyCard}>
            <h3>Strongest Pattern</h3>
            <p>September to December shows a consistent uptrend pattern over 3 years (+15.3% cumulative)</p>
            <button className={styles.modernPrimaryButton}>Explore Strategy</button>
          </div>
          <div className={styles.strategyCard}>
            <h3>Risk Pattern</h3>
            <p>June historically shows consistent negative returns (-3.1% on average)</p>
            <button className={styles.modernPrimaryButton}>Explore Strategy</button>
          </div>
          <div className={styles.strategyCard}>
            <h3>AI Recommendation</h3>
            <p>Consider stronger positions in March (+3.9%) and rebalancing in November (-2.1%)</p>
            <button className={styles.modernPrimaryButton}>AI Analysis</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seasonality;
