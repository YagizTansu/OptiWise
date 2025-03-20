import React, { useState } from 'react';
import { FaQuestion, FaSpinner } from 'react-icons/fa';
import styles from '../../../styles/InteractiveFeatures.module.css';
import technicalAnalysisAI from '../../../services/analysis/technicalAnalysisAI';

interface InteractiveFeaturesProps {
  symbol: string;
}

const InteractiveFeatures: React.FC<InteractiveFeaturesProps> = ({ symbol }) => {
  // Internal state management
  const [userQuestion, setUserQuestion] = useState('');
  const [showQA, setShowQA] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  
  // Handle user questions about the stock
  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    try {
      setIsAnswerLoading(true);
      setShowQA(true);
      
      // Get AI response to user question
      const response = await technicalAnalysisAI.answerStockQuestion(symbol, userQuestion);
      setAnswer(response);
      
      setIsAnswerLoading(false);
    } catch (err) {
      setAnswer(`Sorry, I couldn't answer that question right now. Please try again later.`);
      setIsAnswerLoading(false);
    }
  };

  // Handle pressing Enter in the input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswerLoading) {
      handleAskQuestion();
    }
  };

  return (
    <div className={styles.interactiveSection}>
      <h3>Interactive Features</h3>
      
      <div className={styles.qaSection}>
        <h4>Ask AI About {symbol}</h4>
        <div className={styles.questionForm}>
          <input
            type="text"
            placeholder="Ask a question about this asset..."
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            className={styles.questionInput}
          />
          <button 
            className={styles.askButton}
            onClick={handleAskQuestion}
            disabled={isAnswerLoading || !userQuestion.trim()}
          >
            {isAnswerLoading ? <FaSpinner className={styles.spinnerSmall} /> : <FaQuestion />} Ask
          </button>
        </div>
        
        {showQA && (
          <div className={styles.qaResult}>
            <h5>Q: {userQuestion}</h5>
            <p>{isAnswerLoading ? 'Analyzing...' : answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveFeatures;
