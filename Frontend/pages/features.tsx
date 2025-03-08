import Layout from '../components/Layout'
import styles from '../styles/Features.module.css'
import { 
  FaChartLine, FaDatabase, FaShieldAlt, FaMobileAlt, FaClock, FaUsers, 
  FaBrain, FaGlobe, FaChartBar, FaSearch, FaBell, FaLightbulb, FaRobot, 
  FaBalanceScale, FaNewspaper
} from 'react-icons/fa'
import { useState } from 'react'

export default function Features() {
  const [activeCategory, setActiveCategory] = useState('forecaster');
  const [activeFeature, setActiveFeature] = useState(0);
  
  const categories = [
    { id: 'forecaster', name: 'Forecaster AI Agent' },
    { id: 'analysis', name: 'AI-Powered Analysis' },
    { id: 'macro', name: 'Macroeconomic Insights' },
    { id: 'alerts', name: 'AI-Generated Alerts' },
    { id: 'invest', name: 'Investment Recommendations' },
    { id: 'tools', name: 'Integrated AI Tools' }
  ];
  
  const featuresByCategory = {
    forecaster: [
      {
        icon: <FaGlobe />,
        title: 'Real-Time Global Market Updates',
        description: 'Stay ahead with real-time tracking of stock indices, economic events, geopolitical developments, and financial news from around the world.'
      },
      {
        icon: <FaChartBar />,
        title: 'Hot Topics Analysis',
        description: 'Our AI identifies trending market events such as interest rate hikes, sector movements, and emerging investment opportunities.'
      },
      {
        icon: <FaSearch />,
        title: 'IPO Tracking',
        description: 'Comprehensive scanning of upcoming IPOs with pre-listing analysis and potential investment opportunities before they go public.'
      }
    ],
    analysis: [
      {
        icon: <FaChartLine />,
        title: 'AI-Generated Analysis Reports',
        description: 'Get comprehensive reports evaluating financial health, profitability, debt levels, ROE, and other key metrics to make informed investment decisions.'
      },
      {
        icon: <FaBalanceScale />,
        title: 'Valuation Insights',
        description: 'Advanced valuation methods including DCF and Peter Lynch\'s Method to determine the intrinsic value of stocks with precision.'
      },
      {
        icon: <FaShieldAlt />,
        title: 'Risk Analysis',
        description: 'Sophisticated risk metrics including Altman Z-Score and Piotroski Score to assess investment safety and potential downsides.'
      },
      {
        icon: <FaLightbulb />,
        title: 'MOAT Score Evaluation',
        description: 'Proprietary algorithm rates a company\'s competitive advantage and market dominance on a scale of 1-10 (e.g., NVIDIA 9/10).'
      }
    ],
    macro: [
      {
        icon: <FaDatabase />,
        title: 'Country Economics AI Analysis',
        description: 'Intelligent interpretation of national economic cycles to identify emerging investment opportunities across global markets.'
      },
      {
        icon: <FaChartBar />,
        title: 'Currency Strength AI Forecasting',
        description: 'Real-time identification of strong and weak currencies to optimize international investments and forex trading.'
      },
      {
        icon: <FaSearch />,
        title: 'MegaTrends Detection',
        description: 'Advanced scanning of market data to identify long-term trends like AI, clean energy, and biotechnology before they become mainstream.'
      }
    ],
    alerts: [
      {
        icon: <FaBell />,
        title: 'Insider Transactions Tracking',
        description: 'Automatic detection of significant trades by company executives or institutional investors to signal potential price movements.'
      },
      {
        icon: <FaShieldAlt />,
        title: 'Regulatory Risk Alerts',
        description: 'Timely reports on policy changes, legal developments, and antitrust investigations that could impact your investments.'
      },
      {
        icon: <FaClock />,
        title: 'Real-Time Market Alerts',
        description: 'Instantaneous notifications about market shifts, breakouts, and unusual trading activity affecting your watchlist.'
      }
    ],
    invest: [
      {
        icon: <FaLightbulb />,
        title: 'Highlighted Investment Opportunities',
        description: 'AI-processed earnings reports, seasonal trends, and fair value estimates to spot overlooked investment opportunities.'
      },
      {
        icon: <FaUsers />,
        title: 'Personalized AI Reports',
        description: 'Tailored financial analysis based on your investment style, risk tolerance, and portfolio objectives.'
      },
      {
        icon: <FaMobileAlt />,
        title: 'Portfolio Optimization',
        description: 'Advanced algorithms suggest optimal asset allocation to maximize returns while minimizing risk based on your goals.'
      }
    ],
    tools: [
      {
        icon: <FaRobot />,
        title: 'Forecaster Terminal Integration',
        description: 'Seamless connection with Quantum Screener, COT Reports, and other proprietary tools for comprehensive market analysis.'
      },
      {
        icon: <FaClock />,
        title: '24/7 AI Access',
        description: 'Always-available AI assistant for market updates and investor queries, regardless of market hours or holidays.'
      },
      {
        icon: <FaBrain />,
        title: 'Explainable AI (XAI)',
        description: 'Transparent investment insights using SHAP and LIME technologies to explain the reasoning behind AI-generated decisions.'
      },
      {
        icon: <FaNewspaper />,
        title: 'Sentiment Analysis & News Integration',
        description: 'Real-time market sentiment analysis using FinBERT, TweetNLP, and Google Trends integrated with major financial news sources.'
      }
    ]
  };
  
  const allFeatures = [
    ...featuresByCategory.forecaster,
    ...featuresByCategory.analysis,
    ...featuresByCategory.macro,
    ...featuresByCategory.alerts,
    ...featuresByCategory.invest,
    ...featuresByCategory.tools.slice(0, 2)  // Taking just the first 2 to keep the grid balanced
  ];

  const currentFeatures = featuresByCategory[activeCategory] || [];

  return (
    <Layout title="Features - OptiWise">
      <div className={styles.featuresContainer}>
        <header className={styles.featuresHeader}>
          <h1>OptiWise AI Features</h1>
          <p className={styles.subtitle}>Discover how our advanced AI technology transforms your investment strategy</p>
        </header>

        <div className={styles.categoryNav}>
          {categories.map(category => (
            <button 
              key={category.id}
              className={`${styles.categoryBtn} ${activeCategory === category.id ? styles.activeCategory : ''}`}
              onClick={() => {
                setActiveCategory(category.id);
                setActiveFeature(0);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className={styles.mainFeature}>
          <div className={styles.featureNav}>
            {currentFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`${styles.featureTab} ${activeFeature === index ? styles.active : ''}`}
                onClick={() => setActiveFeature(index)}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
              </div>
            ))}
          </div>
          <div className={styles.featureDetail}>
            {currentFeatures.length > 0 && (
              <>
                <div className={styles.featureIcon}>{currentFeatures[activeFeature].icon}</div>
                <h2>{currentFeatures[activeFeature].title}</h2>
                <p>{currentFeatures[activeFeature].description}</p>
                <button className={styles.learnMoreBtn}>Learn More</button>
              </>
            )}
          </div>
        </div>

        <section className={styles.allFeatures}>
          <h2>Core AI Capabilities</h2>
          <div className={styles.featureGrid}>
            {allFeatures.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureCardIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section className={styles.ctaSection}>
          <h2>Ready to transform your investment strategy?</h2>
          <p>Access the power of AI-driven market intelligence with OptiWise</p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryBtn}>Start Free Trial</button>
            <button className={styles.secondaryBtn}>Schedule a Demo</button>
          </div>
        </section>
      </div>
    </Layout>
  );
}
