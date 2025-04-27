import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { FiMail, FiLock, FiArrowRight, FiCheck, FiShield, FiBarChart, FiPieChart, FiTrendingUp, FiAward, FiAlertCircle, FiTarget } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import styles from '../styles/Login.module.css';
import { useAuth } from '../contexts/AuthContext';

// Ortam değişkeni ile URL'yi belirleyelim
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 
                (typeof window !== 'undefined' ? window.location.origin : '');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (router.query.registered === 'true') {
      setRegistrationSuccess(true);
    }
  }, [router.query]);

  // Mutlak URL kullanarak yönlendirmelerin doğru çalışmasını sağlayalım
  const returnUrl = (router.query.returnUrl as string) || '/';
  const absoluteReturnUrl = returnUrl.startsWith('http') 
    ? returnUrl 
    : `${BASE_URL}${returnUrl.startsWith('/') ? returnUrl : `/${returnUrl}`}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message || 'Failed to sign in');
        setIsLoading(false);
        return;
      }

      // Doğru bir şekilde yönlendirme yapalım
      window.location.href = absoluteReturnUrl;
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      // Google sign-in işlemini başlatalım
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message || 'Failed to sign in with Google');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Sign In | OptiWise</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.page}>
        <div className={styles.split}>
          <div className={styles.leftPanel}>
            <div className={styles.brandWrapper}>
              <div className={styles.brandHeader}>
                <div className={styles.logoContainer}>
                  <div className={styles.logoCircle}>
                    <Image 
                      src="/images/logo.png" 
                      alt="OptiWise Logo" 
                      width={70} 
                      height={70}
                      className={styles.logoImage}
                    />
                  </div>
                </div>
                <h1 className={styles.brandName}>OptiWise</h1>
              </div>
              <p className={styles.brandTagline}>AI-Powered Market Intelligence</p>
              <p className={styles.brandDescription}>
                Take control of your investment strategy with our cutting-edge AI platform that analyzes market trends, predicts movements, and provides actionable insights.
              </p>
            </div>
            
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>94%</span>
                <span className={styles.statLabel}>Prediction Accuracy</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>5M+</span>
                <span className={styles.statLabel}>Data Points Analyzed</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>-40%</span>
                <span className={styles.statLabel}>Risk Reduction</span>
              </div>
            </div>

            <div className={styles.featureList}>
              <h3 className={styles.featuresTitle}>Key Features</h3>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <FiTrendingUp size={16} />
                </div>
                <div className={styles.featureContent}>
                  <span className={styles.featureTitle}>Price Prediction Dashboard</span>
                  <span className={styles.featureText}>
                    Access AI-powered price forecasts with confidence levels for different timeframes, with precise support and resistance levels.
                  </span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <FiBarChart size={16} />
                </div>
                <div className={styles.featureContent}>
                  <span className={styles.featureTitle}>Performance Overview</span>
                  <span className={styles.featureText}>
                    Visualize stock performance with interactive charts that compare against benchmarks and identify relative strength patterns.
                  </span>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <FiPieChart size={16} />
                </div>
                <div className={styles.featureContent}>
                  <span className={styles.featureTitle}>Seasonality Analysis</span>
                  <span className={styles.featureText}>
                    Discover recurring annual patterns that give you an edge in timing trades with statistical confidence indicators.
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.testimonialsContainer}>
              <div className={styles.testimonialControls}>
                <span className={styles.testimonialDot + ' ' + styles.active}></span>
                <span className={styles.testimonialDot}></span>
                <span className={styles.testimonialDot}></span>
              </div>
              <div className={styles.testimonial}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.testimonialAvatar}>
                    <span>MT</span>
                  </div>
                  <div className={styles.testimonialRating}>
                    <span>★★★★★</span>
                  </div>
                </div>
                <p className={styles.quote}>"OptiWise completely transformed my investment approach. Their predictive algorithms helped me avoid a major market correction and their risk analysis tools have given me confidence in volatile conditions."</p>
                <div className={styles.author}>
                  <span className={styles.authorName}>— Michael Thompson</span>
                  <span className={styles.authorTitle}>Investment Director, Pinnacle Partners</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.formContainer}>
              <h2 className={styles.formTitle}>Welcome back</h2>
              {registrationSuccess && <div className={styles.successMessage}>Account created successfully! Please sign in.</div>}
              {error && <div className={styles.errorMessage}>{error}</div>}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>Email</label>
                  <div className={styles.inputWrapper}>
                    <FiMail className={styles.inputIcon} />
                    <input id="email" type="email" className={styles.input} placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <FiLock className={styles.inputIcon} />
                    <input id="password" type="password" className={styles.input} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                  </div>
                </div>

                <button type="submit" className={styles.button} disabled={isLoading}>
                  {isLoading ? 'Signing in...' : (<><span>Sign in</span> <FiArrowRight className={styles.buttonIcon} /></>)}
                </button>
              </form>

              <div className={styles.separator}>
                <span className={styles.separatorText}>or</span>
              </div>

              <button 
                onClick={handleGoogleSignIn} 
                className={`${styles.button} ${styles.googleButton}`}
                disabled={isLoading}
                type="button"
              >
                <FcGoogle className={styles.buttonIcon} />
                <span>Sign in with Google</span>
              </button>

              <div className={styles.footerText}>
                Don't have an account? <Link href="/register" className={styles.footerLink}>Create account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
