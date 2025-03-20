import Layout from '../components/Layout'
import styles from '../styles/Features.module.css'
import { 
  FaChartLine, FaDatabase, FaShieldAlt, FaMobileAlt, FaClock, FaUsers, 
  FaBrain, FaGlobe, FaChartBar, FaSearch, FaBell, FaLightbulb, FaRobot, 
  FaBalanceScale, FaNewspaper, FaCalendarAlt, FaChartPie, FaFileAlt
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
      },
      {
        icon: <FaRobot />,
        title: 'AI Forecast',
        description: 'Advanced AI predictions of market movements and asset performance based on comprehensive data analysis and machine learning algorithms.'
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
      },
      {
        icon: <FaChartLine />,
        title: 'Market Overview',
        description: 'Comprehensive overview of market conditions, trends, and asset performance with interactive charts and insights.'
      },
      {
        icon: <FaBalanceScale />,
        title: 'Overbought/Oversold Analysis',
        description: 'Technical indicators to identify when assets are trading above or below their true value, providing optimal entry and exit points.'
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
      },
      {
        icon: <FaCalendarAlt />,
        title: 'Seasonality Analysis',
        description: 'Historical pattern recognition to identify seasonal trends in asset prices and market behavior for strategic timing of investments.'
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
      },
      {
        icon: <FaChartPie />,
        title: 'Fundamental Analysis',
        description: 'In-depth evaluation of financial statements, business models, and competitive positioning to determine long-term investment value.'
      },
      {
        icon: <FaFileAlt />,
        title: 'Comprehensive Reports',
        description: 'Detailed investment reports with actionable insights, combining technical, fundamental, and AI-driven analysis.'
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
    ...featuresByCategory.forecaster.slice(0, 3),
    ...featuresByCategory.analysis.slice(0, 3),
    ...featuresByCategory.macro.slice(0, 3),
    ...featuresByCategory.alerts.slice(0, 3),
    ...featuresByCategory.invest.slice(0, 3),
    ...featuresByCategory.tools.slice(0, 3)
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
