import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import styles from '../../../styles/Analyses.module.css';

interface SentimentData {
  traderCategory: string;
  sentiment: string;
  netPosition: string;
  change: string;
  longPercentage: string;
  description: string;
}

// Sentiment data moved into the component
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

interface CurrentPositionDistributionProps {
  symbol: string;
}

const CurrentPositionDistribution: React.FC<CurrentPositionDistributionProps> = ({ symbol }) => {
  // Parse longPercentage to use in the doughnut charts
  const parsePercentage = (percentage: string): number => {
    return parseInt(percentage.replace('%', ''));
  };

  return (
    <div className={styles.overviewSection}>
      <div className={styles.sectionHeader}>
        <h2>Current Position Distribution - {symbol}</h2>
        <button className={styles.modernIconButton} title="Learn About Position Distribution">
          <FaInfoCircle />
        </button>
      </div>
      <div className={styles.correlationMetrics}>
        {sentimentData.slice(0, 3).map((trader, index) => (
          <div className={styles.compactCorrelationCard} key={index}>
            <h3>{trader.traderCategory}</h3>
            <div className={styles.correlationVisual}>
              <div className={styles.smallDonutContainer}>
                <Doughnut 
                  data={{
                    labels: ['Long', 'Short'],
                    datasets: [{
                      data: [
                        parsePercentage(trader.longPercentage), 
                        100 - parsePercentage(trader.longPercentage)
                      ],
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
                <div className={styles.correlationValueCompact}>{trader.longPercentage} Long</div>
              </div>
              <div className={styles.correlationDescription}>
                <div className={styles.positionDetails}>
                  <div className={styles.positionDetail}>
                    <span>Net Position:</span>
                    <span className={trader.netPosition.startsWith('+') ? styles.positiveValue : styles.negativeValue}>
                      {trader.netPosition} contracts
                    </span>
                  </div>
                  <div className={styles.positionDetail}>
                    <span>Change:</span>
                    <span className={trader.change.startsWith('+') ? styles.positiveValue : styles.negativeValue}>
                      {trader.change}
                    </span>
                  </div>
                </div>
                <p>{trader.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentPositionDistribution;
