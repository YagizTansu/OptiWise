import { FaQuestion } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';

// Correlation data for visualizations
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

interface PatternCorrelationProps {
  comparisonPeriods: { first: string; second: string };
}

const PatternCorrelation: React.FC<PatternCorrelationProps> = ({ comparisonPeriods }) => {
  return (
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
  );
};

export default PatternCorrelation;
