import Layout from '../components/Layout'
import styles from '../styles/Features.module.css'
import { 
  FaChartLine, FaDatabase, FaShieldAlt, FaMobileAlt, FaClock, FaUsers, 
  FaBrain, FaGlobe, FaChartBar, FaSearch, FaBell, FaLightbulb, FaRobot, 
  FaBalanceScale, FaNewspaper, FaCalendarAlt, FaChartPie, FaFileAlt,
  FaTable, FaCalculator, FaMicroscope, FaChartArea, FaBuilding, FaPercentage, 
  FaCalendarCheck, FaInfoCircle, FaMoneyBillWave, FaArrowUp, FaCogs, FaHistory, FaBullseye
} from 'react-icons/fa'
import { AwaitedReactNode, JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useState } from 'react'

export default function Features() {
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeToolFeature, setActiveToolFeature] = useState(0);
  
  const categories = [
    { id: 'overview', name: 'Overview' },
    { id: 'seasonality', name: 'Seasonality' },
    { id: 'overbought', name: 'Overbought/Oversold' },
    { id: 'fundamental', name: 'Fundamental' },
    { id: 'insiders', name: 'Insiders' },
    { id: 'report', name: 'Report' },
    { id: 'aiagent', name: 'AI Agent' }
  ];
  
  const featuresByCategory = {
    overview: [
      {
        icon: <FaBuilding />,
        title: 'Company Profile',
        description: 'Instantly grasp any company\'s complete business profile with our comprehensive dashboard. For example, when researching Apple, you\'ll see not just basic information, but detailed insights into their revenue breakdown (58% from iPhone, 11% from Services, etc.), competitive positioning against Samsung and Google, executive team backgrounds, and global manufacturing footprint. This helps you understand the full scope of a company\'s operations beyond what standard financial data shows.'
      },
      {
        icon: <FaChartArea />,
        title: 'Performance Overview',
        description: 'Visualize stock performance through interactive charts that let you quickly switch between timeframes (1D to 5Y) with a single click. For instance, comparing Tesla\'s 6-month performance against the S&P 500 reveals not only price movements but also key technical indicators like moving averages and momentum oscillators. You can overlay sector peers (like Ford and GM) to identify relative strength patterns, helping you determine if a stock is outperforming its industry or lagging behind.'
      },
      {
        icon: <FaPercentage />,
        title: 'Performance Metrics',
        description: 'Get instant insights with our color-coded performance metrics that show you exactly where a stock stands. For example, when viewing Microsoft, you\'ll immediately see green metrics showing 15% YTD returns and bullish MACD crossovers, while potentially flagging concerning metrics in red, such as declining relative strength against the tech sector. Each metric includes simple explanations—like "RSI above 70 indicates potential overbought conditions"—making technical analysis accessible even to beginning investors.'
      },
      {
        icon: <FaCalendarCheck />,
        title: 'Annual Performance',
        description: 'Discover long-term performance patterns that might otherwise remain hidden. For example, our visualization of Amazon\'s annual returns might reveal that the stock has consistently gained in Q4 but struggled in Q2. You\'ll see exactly how the stock performed during major market events like the 2020 pandemic crash (showing its 27% drawdown and 4-month recovery period), giving you valuable context for how the company might weather future market turbulence.'
      },
      {
        icon: <FaInfoCircle />,
        title: 'Key Statistics',
        description: 'Compare a stock\'s vital metrics against industry benchmarks at a glance. When analyzing Nvidia, for instance, you\'ll see not just that its P/E ratio is 85, but that this is 210% above the semiconductor industry average—with a trend indicator showing this premium has been expanding. Each metric is accompanied by simple explanations like "Current Ratio of 3.2 indicates strong short-term financial health," helping you interpret complex financial data without an accounting degree.'
      },
      {
        icon: <FaMoneyBillWave />,
        title: 'Dividends',
        description: 'Track every aspect of a company\'s dividend payments to optimize your income strategy. For example, with Johnson & Johnson, you\'ll see its 59-year streak of dividend increases, recent payout ratio of 43% (indicating sustainability), and projected future payments. You can visualize how reinvesting dividends would have affected your returns, such as turning a $10,000 investment in 2000 into $65,830 today vs. $42,150 without reinvestment—powerful information for income-focused investors.'
      }
    ],
    seasonality: [
      {
        icon: <FaCalendarAlt />,
        title: 'Seasonality Analysis',
        description: 'Discover recurring annual patterns that could give you an edge in timing your trades. For example, our analysis of the S&P 500 reveals that September has historically been the weakest month (-0.83% average return since 1950), while December shows the strongest performance (+1.41% average). For individual stocks like Home Depot, you might discover it typically outperforms from February to April during the spring renovation season. Our confidence indicators show you which patterns are most statistically reliable, helping you plan entries and exits with greater precision.'
      },
      {
        icon: <FaChartPie />,
        title: 'Pattern Correlation',
        description: 'Uncover hidden relationships between different assets and market cycles that most investors miss. For instance, you might discover that gold mining stocks (GDX) typically rally 2-3 weeks after initial Fed rate cuts, or that utility stocks show inverse correlation to 10-year Treasury yields with a 0.82 correlation coefficient. Our visualizations make these complex relationships easy to understand—like showing how Bitcoin has developed a 0.65 correlation with tech stocks since 2020, despite previously moving independently—helping you diversify more effectively.'
      },
      {
        icon: <FaChartBar />,
        title: 'Time Average Returns',
        description: 'Pinpoint the specific days, weeks, and months that historically offer the best opportunities. For example, our analysis of Apple might show that the stock has gained an average of 2.8% in the week following iPhone launch events, or that Mondays have been its strongest day of the week (+0.31% average) over the past 5 years. For sectors like retail, you\'ll see precisely how they perform before, during, and after the holiday shopping season, with statistical significance markers highlighting which patterns you can rely on most.'
      },
      {
        icon: <FaLightbulb />,
        title: 'Seasonal Strategy Insights',
        description: 'Get ready-to-implement trading strategies based on reliable seasonal patterns. For example, our "Energy Sector Winter Rotation" strategy might show you exactly when to enter oil stocks (typically mid-October) and when to exit (early May), with historical metrics showing this approach would have outperformed buy-and-hold by 7.3% annually with lower volatility. Each strategy includes specific entry/exit signals, position sizing recommendations, and historical win rates—like "this approach has been profitable in 14 of the last 16 years with an average gain of 11.2%."'
      }
    ],
    overbought: [
      {
        icon: <FaChartArea />,
        title: 'Advanced DPO Analysis',
        description: 'See through market noise to identify the natural rhythm of price movements. For example, when analyzing Tesla, our Detrended Price Oscillator might reveal a 42-day price cycle that isn\'t visible on standard charts, showing you that the stock is approaching a cyclical low despite overall bullish trends. Our system automatically calculates optimal entry points based on these cycles—like highlighting that Bitcoin has reached the bottom of its current cycle with 83% statistical probability based on historical patterns. This gives you an edge in timing entries and exits with precision.'
      },
      {
        icon: <FaChartLine />,
        title: 'Indicator Chart',
        description: 'Gain insights from multiple technical indicators presented in a single, unified view. When analyzing Amazon, for instance, you\'ll see coordinated signals across RSI (showing oversold at 29.5), Stochastic (bullish crossover), and our proprietary OptiScore (rating of 8.2/10 bullish) all in one place. Each indicator includes customizable parameters and color-coded signals—like showing that Gold has given only 7 "Strong Buy" signals in the past 3 years, with 6 resulting in gains averaging 12.3% over the following 30 days.'
      },
      {
        icon: <FaChartBar />,
        title: 'Price & Volume Analysis',
        description: 'Detect institutional money movements that often precede major price changes. For example, our volume analysis of Microsoft might reveal unusual accumulation patterns where the stock trades sideways but with 250% above-average volume, often a precursor to breakouts. You\'ll spot telling divergences—like when Facebook\'s price made new highs but on declining volume (a warning sign)—with our AI automatically flagging these patterns. For crypto assets, our analysis can detect whale movements, like when Bitcoin shows unusually large transactions coinciding with price support levels.'
      }
    ],
    fundamental: [
      {
        icon: <FaChartPie />,
        title: 'Stock Dashboard',
        description: 'Get a comprehensive view of any company\'s financial health in seconds rather than hours of research. For example, looking at Costco\'s dashboard instantly shows its gross margin trend (increasing steadily at 0.3% annually), debt-to-EBITDA ratio (very conservative at 1.2x), and return on invested capital (impressive at 18.3% and above peers). Our color-coded indicators immediately flag strengths (green metrics showing consistent revenue growth of 9.7% annually) and potential concerns (yellow warning on recent inventory buildup), giving you the complete picture far beyond just the stock price.'
      },
      {
        icon: <FaChartLine />,
        title: 'Technical Analysis',
        description: 'Combine technical indicators with fundamental context for more informed trading decisions. For instance, when Nike approaches a major support level at $92.50, our system not only highlights this technical level but also shows it coincides with a 15x P/E ratio—historically a value entry point for this stock. Our AI pattern recognition might identify that Shopify is forming a cup-and-handle pattern near its 200-day moving average, while simultaneously reaching its lowest price-to-sales ratio in 3 years, giving you multiple confirmation signals for potential entry points.'
      },
      {
        icon: <FaBuilding />,
        title: 'Company Snapshot',
        description: 'Quickly grasp a company\'s business model and competitive position without reading lengthy reports. For example, Disney\'s snapshot breaks down revenue streams (40% from theme parks, 35% from streaming, 25% from other), geographic exposure (60% domestic, 40% international), and key competitors in each segment. Our SWOT analysis highlights specific strengths (unmatched content library), weaknesses (high streaming content costs), opportunities (international expansion in Asia), and threats (increasing competition from tech giants), all in a simple, visual format you can absorb in minutes.'
      },
      {
        icon: <FaFileAlt />,
        title: 'Financial Statements',
        description: 'Explore a decade of financial data with intelligent insights highlighting what really matters. When examining Walmart\'s statements, our system automatically highlights significant changes—like operating margin compression from 5.6% to 4.1% over 5 years—and explains in plain English: "This 1.5% decline in margins reflects increased e-commerce investments and higher labor costs, impacting profitability." When looking at Tesla\'s cash flow, you\'ll see quarterly capital expenditures with automated forecasts of future cash needs based on announced expansion plans.'
      }
    ],
    insiders: [
      {
        icon: <FaUsers />,
        title: 'Ownership Structure',
        description: 'Understand exactly who owns and controls a company with our comprehensive ownership breakdown. For example, with Meta (Facebook), you\'ll see that Mark Zuckerberg controls 58% of voting rights despite owning only 14% of shares through the dual-class share structure. Our color-coded indicators instantly show you if insider ownership is increasing or decreasing—like highlighting that Amazon executives have reduced their holdings by 8.3% over the past quarter while institutional ownership has increased by 2.1%, potentially signaling differing outlooks between insiders and professional investors.'
      },
      {
        icon: <FaDatabase />,
        title: 'Insider Holdings',
        description: 'Track exactly what company executives own and how their holdings have changed over time. For example, you might see that Tesla\'s CTO recently acquired 25,000 shares through option exercises but retained all shares rather than selling them—a potentially bullish signal. Our system highlights key insider positions, such as showing that Apple\'s CEO Tim Cook owns approximately $500M in company stock, representing over 90% of his net worth, which indicates strong alignment with shareholders. C-suite holdings are prominently displayed with trend indicators showing their recent buying or selling patterns.'
      },
      {
        icon: <FaBuilding />,
        title: 'Institutional Ownership',
        description: 'See which professional investors are betting on (or against) a company\'s future. For instance, with Nvidia, you might discover that Vanguard owns 7.8% of shares, Blackrock holds 6.3%, and notably, Renaissance Technologies recently doubled their position to 2.1M shares. Our quarter-by-quarter comparison shows you exactly how these institutional positions have changed—like highlighting that 15 new hedge funds initiated positions last quarter while 3 major holders reduced their stakes. This institutional money flow often precedes major price movements and reveals professional sentiment.'
      },
      {
        icon: <FaBell />,
        title: 'Insider Transactions',
        description: 'Never miss significant insider buying or selling with our comprehensive transaction monitoring. For example, you\'ll see not just that Netflix\'s CFO sold shares, but that it was part of a predetermined 10b5-1 plan (less significant), while the unexpected purchase of $2.8M in shares by the COO outside of any scheduled plan might signal strong confidence. Our filtering tools let you focus on what matters—like showing only C-suite purchases over $100K in the past 30 days—with transaction details clearly labeled as "Significant Buy" or "Routine Sale" to help you interpret insider activity correctly.'
      },
      {
        icon: <FaChartPie />,
        title: 'Ownership Analysis',
        description: 'Gain deeper insights into what ownership patterns might mean for future stock performance. Our AI-powered analysis might reveal, for example, that when Microsoft insiders increased their holdings by more than 5% historically, the stock outperformed the market by an average of 11.2% over the following 12 months. You\'ll see ownership concentration metrics—like that the top 5 Berkshire Hathaway institutional investors control 22% of the float—and correlation analysis showing how insider selling patterns at AMD have historically preceded earnings shortfalls with 72% accuracy.'
      }
    ],
    report: [
      {
        icon: <FaLightbulb />,
        title: 'Analysis Tools',
        description: 'Generate comprehensive investment reports tailored to your specific investment style in seconds. For example, as a value investor researching Bank of America, you\'ll receive a detailed analysis highlighting its price-to-book ratio (currently 1.2x vs. historical average of 1.8x), dividend safety metrics, stress test performance, and comparison against peers like JPMorgan and Citigroup. Each report includes probability-based predictions—such as "87% confidence of dividend growth over next 3 years based on payout ratio and earnings stability"—and alternative scenarios showing how different economic environments might impact your investment.'
      },
      {
        icon: <FaChartLine />,
        title: 'Analyst Recommendation',
        description: 'Cut through conflicting Wall Street opinions with our analyst sentiment visualization tools. For Amazon, you might see that 34 analysts rate it "Buy," 3 "Hold," and 0 "Sell," with an average price target of $178 (representing 15% upside). But more importantly, our system highlights which analysts have the best track record—like showing that Jane Smith at Morgan Stanley has been 78% accurate on tech stocks and recently upgraded her target from $165 to $190. You\'ll see exactly how sentiment has shifted over time, such as identifying that analyst upgrades began accelerating three months ago when the stock was 20% lower.'
      },
      {
        icon: <FaFileAlt />,
        title: 'Analyst Reports',
        description: 'Access insights from top Wall Street research without reading hundreds of pages. When a new 35-page Goldman Sachs report on Salesforce is released, our AI extracts and summarizes the key points: "Goldman maintains Buy rating with $250 target based on cloud market share gains, improving margins expected to reach 25% by FY23, and expansion opportunities in data analytics." Our comparison tool shows you where analysts agree or disagree—like highlighting that while most analysts cite AI integration as a strength for Microsoft, two prominent analysts believe the company is overinvesting in this area relative to immediate revenue potential.'
      },
      {
        icon: <FaNewspaper />,
        title: 'Events & Developments',
        description: 'Stay ahead of market-moving events with our comprehensive calendar and impact analysis. For example, before Apple\'s upcoming product launch, you\'ll see not just the event date but historical stock performance patterns (-2.1% average one day after iPhone announcements despite positive reviews). When Johnson & Johnson announces a major acquisition, our system shows similar past moves and their long-term impact on margins and growth rates. For your portfolio stocks, we automatically highlight high-impact events—like flagging that Pfizer has an FDA approval decision approaching that historically moves the stock ±8% regardless of market conditions.'
      },
      {
        icon: <FaDatabase />,
        title: 'SEC Filings',
        description: 'Extract critical insights from complex regulatory documents without legal expertise. When reviewing Tesla\'s latest 10-K, our system automatically highlights material changes from previous filings—like identifying new risk disclosure language about supply chain vulnerabilities or subtle shifts in production capacity projections. Our language analysis detects meaningful changes in tone, such as when Moderna\'s latest filing showed a 27% increase in cautionary language about competition despite public statements expressing confidence. You\'ll receive instant alerts when companies you follow make significant filings, with key changes pre-highlighted for quick review.'
      }
    ],
    aiagent: [
      {
        icon: <FaBullseye />,
        title: 'Price Prediction Dashboard',
        description: 'Access accurate AI-powered price forecasts with confidence levels for different timeframes. For instance, when analyzing NVIDIA, you\'ll see precise short-term predictions (+2.4% with 75% confidence), mid-term outlooks (+5.7% with 65% confidence), and long-term projections (+10.2% with 55% confidence). Our system identifies key support ($206.31, $199.93) and resistance levels ($219.07, $225.45) based on advanced algorithmic analysis of historical patterns, volume profiles, and price action, giving you clear thresholds for setting entry and exit points.'
      },
      {
        icon: <FaLightbulb />,
        title: 'Smart Analysis Summary',
        description: 'Get instant, actionable intelligence tailored to your investment decisions. For example, our AI might detect that "Tesla is showing bullish momentum with recent trading volume 56% above 30-day average, while simultaneously identifying overhead resistance at $267.50 that needs to be cleared for further upside." Each analysis includes key market catalysts—like highlighting that Apple\'s recent price action is being driven by AI announcements at WWDC and shifting institutional sentiment rather than fundamental changes—helping you understand not just what\'s happening, but why.'
      },
      {
        icon: <FaChartLine />,
        title: 'Multi-Timeframe Predictions',
        description: 'View precise price forecasts across multiple timeframes with interactive visualizations. For Microsoft, you might see daily predictions showing a projected consolidation pattern with 1.2% volatility, weekly forecasts indicating a potential breakout above $340 with 62% probability, and monthly projections showing a likely trading range of $325-$355. Our probability distribution charts show you the full range of potential outcomes—like indicating a 33% chance of a 2.5% gain, but only a 5% chance of a 5% loss—giving you a complete picture of risk versus reward for any timeframe.'
      },
      {
        icon: <FaCogs />,
        title: 'Analysis Rationale',
        description: 'Understand exactly what\'s driving our AI\'s predictions with comprehensive technical and fundamental context. When analyzing Amazon, you\'ll see how specific factors like RSI (currently 58, indicating moderate momentum), MACD (showing recent bullish crossover), and moving averages (price 4.2% above 50-day MA) contribute to the forecast. Our sentiment analysis might reveal that institutional investors appear cautiously optimistic based on recent statements and positioning, while options market activity suggests traders are pricing in 4.5% volatility through the next earnings report.'
      },
      {
        icon: <FaHistory />,
        title: 'Historical Accuracy',
        description: 'Evaluate the reliability of our predictions with transparent accuracy metrics. Our system shows you how previous forecasts have performed—like demonstrating 81% overall accuracy, with 86% accuracy for daily predictions, 77% for weekly, and 75% for monthly forecasts. You can review past predictions for stocks similar to your current analysis, such as seeing that our AI correctly anticipated 8 out of 10 major price movements for semiconductor stocks over the past quarter, giving you confidence in the current forecast for AMD or Intel.'
      },
      {
        icon: <FaRobot />,
        title: 'Interactive Features',
        description: 'Customize analyses to your specific needs with interactive tools and settings. For instance, when researching Johnson & Johnson, you can adjust the prediction model to emphasize technical factors, fundamental metrics, or market sentiment based on your investment style. You can test different scenarios—like seeing how a 0.25% Fed rate cut might impact bank stocks or how a 10% increase in oil prices could affect airline stocks—with instant visual feedback showing revised predictions, support/resistance levels, and probability distributions tailored to your specific scenario.'
      }
    ]
  };

  const toolsFeatures = [
    {
      icon: <FaTable />,
      title: 'Global Market Rankings',
      description: 'Discover the strongest and weakest markets worldwide through our comprehensive ranking system. For example, you might find that Vietnam\'s stock market ranks #1 in momentum while showing improving fundamentals, suggesting potential opportunity. Our rankings combine multiple factors—like showing that Brazil scores highly on value metrics (P/E of 7.2) but poorly on currency stability, giving you the complete picture. Each market receives an overall OptiWise Score from 1-100, allowing you to quickly identify promising international opportunities like Taiwan\'s semiconductor sector showing strong relative performance despite broader Asian market weakness.'
    },
    {
      icon: <FaCalculator />,
      title: 'Breakeven',
      description: 'Optimize your position sizing and risk management with our advanced breakeven calculator. For example, when considering a $5,000 position in AMD, our tool shows you exactly how much the stock needs to move (2.3%) to cover trading costs, and recommends optimal position sizing based on your portfolio value and risk tolerance. For options strategies, it calculates precise breakeven points—like showing that your Apple iron condor strategy needs the stock to stay between $172.50 and $187.50 to be profitable. Each calculation includes recommended stop-loss levels and profit targets based on historical volatility patterns.'
    },
    {
      icon: <FaMicroscope />,
      title: 'Quantum Screener',
      description: 'Discover hidden investment opportunities that match your exact criteria with our powerful screening tool. For instance, you could find all mid-cap healthcare companies with revenue growth above 15%, insider buying in the last 3 months, and positive free cash flow—instantly revealing 5 stocks meeting these specific parameters. Our AI-enhanced filters go beyond basic metrics to include pattern recognition—like identifying stocks forming cup-and-handle patterns near major support levels—and sentiment analysis from earnings calls. Save custom screens for regular use, such as your "Dividend Growth Leaders" screen that identifies companies with 5+ years of dividend increases and payout ratios below 50%.'
    },
    {
      icon: <FaChartArea />,
      title: 'COT Reports',
      description: 'Gain insights from professional futures traders\' positioning before major market moves occur. For example, our COT analysis might show that commercial hedgers (smart money) are building their largest long position in corn futures since 2012—often a reliable bullish indicator. Our visualizations make complex data intuitive—like clearly showing that speculative traders are excessively short the Japanese Yen while commercials are taking the opposite side, potentially signaling an upcoming reversal. Historical context is automatically provided, showing how similar positioning in crude oil futures previously preceded a 15% price increase over the following 8 weeks.'
    }
  ];

  const currentFeatures = featuresByCategory[activeCategory];      
  return (
    <Layout title="Features - OptiWise">
      <div className={styles.featuresContainer}>
        <header className={styles.featuresHeader}>
          <h2>OptiWise AI Features</h2>
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
            {currentFeatures.map((feature: { icon: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; title: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }, index: string | number | bigint | ((prevState: number) => number) | null | undefined) => (
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
              </>
            )}
          </div>
        </div>

        <section className={styles.toolsSection}>
          <h2>Tools and Features</h2>
          <div className={styles.mainFeature}>
            <div className={styles.featureNav}>              {toolsFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className={`${styles.featureTab} ${activeToolFeature === index ? styles.active : ''}`}
                  onClick={() => setActiveToolFeature(index)}
                >
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3>{feature.title}</h3>
                </div>
              ))}
            </div>
            <div className={styles.featureDetail}>
              {toolsFeatures.length > 0 && (
                <>
                  <div className={styles.featureIcon}>{toolsFeatures[activeToolFeature].icon}</div>
                  <h2>{toolsFeatures[activeToolFeature].title}</h2>
                  <p>{toolsFeatures[activeToolFeature].description}</p>
                </>
              )}
            </div>
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