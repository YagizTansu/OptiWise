import { FaExpand, FaInfoCircle } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';

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

const TimeAverageReturns: React.FC = () => {
  return (
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
  );
};

export default TimeAverageReturns;
