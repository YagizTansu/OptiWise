import React from 'react';
import styles from '../../../styles/ForecastAI.module.css';

interface AnalysisData {
  summary: string;
  keyFindings: string[];
  catalysts: string[];
}

interface SmartAnalysisSummaryProps {
  analysis: AnalysisData;
  summaryText: string;
}

const SmartAnalysisSummary: React.FC<SmartAnalysisSummaryProps> = ({ analysis, summaryText }) => {
  return (
    <div className={styles.analysisSection}>
      <h3>Smart Analysis Summary</h3>
      <div className={styles.analysisSummary}>
        <p className={styles.summaryText}>
          {summaryText}
        </p>
        
        <div className={styles.keyFindings}>
          <h4>Key Findings</h4>
          <ul>
            {analysis.keyFindings && analysis.keyFindings.length > 0 ? 
              analysis.keyFindings
                .filter(finding => finding && !finding.includes('s/'))
                .map((finding, index) => (
                  <li key={`finding-${index}`}>{finding}</li>
                ))
              : 
              <li>No key findings available at this time.</li>
            }
          </ul>
        </div>
        
        <div className={styles.catalysts}>
          <h4>Potential Catalysts</h4>
          <ul>
            {analysis.catalysts && analysis.catalysts.length > 0 ?
              analysis.catalysts
                .filter(catalyst => catalyst && !catalyst.includes('s/'))
                .map((catalyst, index) => (
                  <li key={`catalyst-${index}`}>{catalyst}</li>
                ))
              :
              <li>No potential catalysts identified at this time.</li>
            }
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmartAnalysisSummary;
