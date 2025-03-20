import { useState } from 'react';
import Head from 'next/head';
import { FaRobot, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import styles from '../styles/AIAssistant.module.css';
import Layout from '../components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AIAssistant() {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([
    { text: "Hello! I'm your OptiWise AI Assistant. How can I help with your investment questions today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { text: input, isUser: true }]);
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          text: `I've analyzed your question about "${input}". Based on current market data, I would recommend exploring this further through our market insights tool or reviewing related economic indicators.`, 
          isUser: false 
        }
      ]);
      setInput('');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className={styles.container}>
          <Head>
            <title>AI Assistant | OptiWise</title>
            <meta name="description" content="Get intelligent financial assistance with OptiWise AI" />
          </Head>

          <header className={styles.header}>
            <div className={styles.iconContainer}>
              <FaRobot className={styles.headerIcon} />
            </div>
            <div>
              <h1 className={styles.title}>AI Assistant</h1>
              <p className={styles.subtitle}>
                Get intelligent market analysis and personalized financial recommendations
              </p>
            </div>
          </header>

          <main className={styles.main}>
            <div className={styles.chatContainer}>
              <div className={styles.messagesList}>
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`${styles.message} ${message.isUser ? styles.userMessage : styles.aiMessage}`}
                  >
                    {!message.isUser && <FaRobot className={styles.messageIcon} />}
                    <p>{message.text}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className={`${styles.message} ${styles.aiMessage}`}>
                    <FaRobot className={styles.messageIcon} />
                    <div className={styles.typingIndicator}>
                      <FaSpinner className={styles.spinner} />
                      <span>Analyzing data...</span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className={styles.inputForm}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about market trends, stock analysis, or investment advice..."
                  className={styles.messageInput}
                />
                <button 
                  type="submit" 
                  className={styles.sendButton}
                  disabled={!input.trim() || isLoading}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>

            <div className={styles.featuresSection}>
              <h2>What I Can Help With</h2>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <h3>Market Analysis</h3>
                  <p>Get insights on current market conditions and trends</p>
                </div>
                <div className={styles.featureItem}>
                  <h3>Investment Ideas</h3>
                  <p>Discover potential investment opportunities based on your goals</p>
                </div>
                <div className={styles.featureItem}>
                  <h3>Risk Assessment</h3>
                  <p>Evaluate the risk level of different investment strategies</p>
                </div>
                <div className={styles.featureItem}>
                  <h3>Educational Guidance</h3>
                  <p>Learn more about financial concepts and investment approaches</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
