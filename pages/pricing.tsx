import Layout from '../components/Layout'
import styles from '../styles/Pricing.module.css'
import { FaCheck } from 'react-icons/fa'
import { useState } from 'react'

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const plans = [
    {
      name: 'Basic',
      monthlyPrice: 19,
      annualPrice: 190,
      description: 'Great for beginners and individual investors',
      features: [
        'Real-Time Global Market Updates',
        'Basic AI Analysis Reports',
        'Portfolio Tracking',
        'Email Support',
        'Mobile Access'
      ]
    },
    {
      name: 'Pro',
      monthlyPrice: 39,
      annualPrice: 390,
      description: 'Perfect for active traders and professionals',
      features: [
        'Everything in Basic',
        'Advanced AI Forecasting',
        'Technical Analysis Tools',
        'Risk Analysis',
        'Priority Support',
        'Trading Alerts'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      monthlyPrice: 199,
      annualPrice: 1990,
      description: 'Complete solution for institutions and funds',
      features: [
        'Everything in Pro',
        'Custom AI Models',
        'API Access',
        'Dedicated Account Manager',
        'White-label Solutions',
        'Team Collaboration Tools',
        'Custom Reporting'
      ]
    }
  ];

  return (
    <Layout title="Pricing - OptiWise">
      <div className={styles.pricingContainer}>
        <header className={styles.pricingHeader}>
          <h1>Simple, Transparent Pricing</h1>
          <p className={styles.subtitle}>Choose the plan that fits your investment needs</p>
          
          <div className={styles.pricingToggle}>
            <span className={!isAnnual ? styles.active : ''}>Monthly</span>
            <label className={styles.toggle}>
              <input 
                type="checkbox" 
                checked={isAnnual}
                onChange={() => setIsAnnual(!isAnnual)}
              />
              <span className={styles.slider}></span>
            </label>
            <span className={isAnnual ? styles.active : ''}>
              Annual <span className={styles.discount}>Save 20%</span>
            </span>
          </div>
        </header>

        <div className={styles.pricingPlans}>
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`${styles.pricingPlan} ${plan.popular ? styles.popular : ''}`}
            >
              {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}
              <h2>{plan.name}</h2>
              <div className={styles.planPrice}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>
                  {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                <span className={styles.period}>
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
              <p className={styles.planDescription}>{plan.description}</p>
              <button className={styles.planButton}>
                Get Started
              </button>
              <ul className={styles.planFeatures}>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <FaCheck className={styles.checkIcon} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <section className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>Can I change plans later?</h3>
              <p>Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Is there a free trial?</h3>
              <p>We offer a 14-day free trial for all new users to explore our platform and features before committing.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, PayPal, and bank transfers for annual Enterprise plans.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Can I cancel at any time?</h3>
              <p>Yes, you can cancel your subscription at any time and you won't be charged for the next billing cycle.</p>
            </div>
          </div>
        </section>
        
        <section className={styles.ctaSection}>
          <h2>Ready to optimize your investment strategy?</h2>
          <p>Start your 14-day free trial today. No credit card required.</p>
          <button className={styles.ctaButton}>Start Free Trial</button>
        </section>
      </div>
    </Layout>
  );
}
