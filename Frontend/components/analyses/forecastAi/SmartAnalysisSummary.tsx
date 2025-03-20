import React from 'react';
import styles from '../../../styles/SmartAnalysisSummary.module.css';

interface SmartAnalysisSummaryProps {
  analysis: {
    summary: string;
    keyFindings: string[];
    catalysts: string[];
  };
  summaryText: string;
}

const SmartAnalysisSummary: React.FC<SmartAnalysisSummaryProps> = ({ analysis, summaryText }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Smart Analysis Summary</h3>
      
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <span className={styles.badge}>Analysis</span>
        </div>
        <div className={styles.summaryContent}>
          <p>{summaryText}</p>
        </div>
      </div>
      
      <div className={styles.sectionsContainer}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Key Findings</h4>
          </div>
          <ul className={styles.findingsList}>
            {analysis.keyFindings.map((finding, index) => (
              <li key={index} className={styles.findingItem}>
                <span className={styles.bulletPoint}></span>
                {finding}
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h4>Potential Catalysts</h4>
          </div>
          <ul className={styles.catalystsList}>
            {analysis.catalysts.map((catalyst, index) => (
              <li key={index} className={styles.catalystItem}>
                <span className={styles.bulletPoint}></span>
                {catalyst}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmartAnalysisSummary;
