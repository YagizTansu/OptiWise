import { useState } from 'react';
import { FaChartBar, FaChartLine, FaFileAlt } from 'react-icons/fa';
import styles from '../../../styles/Analyses.module.css';

interface AnalysisMethodsProps {
  symbol: string;
  viewMode: string;
  setViewMode: (mode: string) => void;
}

const AnalysisMethods = ({ 
  symbol, 
  viewMode, 
  setViewMode
}: AnalysisMethodsProps) => {
  return (
    <div className={styles.analysisMethodsSection}>
      <div className={styles.viewToggle}>
        <button 
          className={`${styles.modernTabButton} ${viewMode === 'visual' ? styles.activeTab : ''}`}
          onClick={() => setViewMode('visual')}
        >
          <FaChartBar /> Visual
        </button>
        <button 
          className={`${styles.modernTabButton} ${viewMode === 'raw' ? styles.activeTab : ''}`}
          onClick={() => setViewMode('raw')}
        >
          <FaChartLine /> Raw
        </button>
        <button 
          className={`${styles.modernTabButton} ${viewMode === 'transcripts' ? styles.activeTab : ''}`}
          onClick={() => setViewMode('transcripts')}
        >
          <FaFileAlt /> Transcripts
        </button>
      </div>
    </div>
  );
};

export default AnalysisMethods;
