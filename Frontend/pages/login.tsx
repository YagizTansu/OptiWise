import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { FiMail, FiLock, FiArrowRight, FiCheck, FiShield, FiBarChart } from 'react-icons/fi';
import styles from '../styles/Login.module.css';
import { supabase } from '../utils/supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user was redirected after registration
    if (router.query.registered === 'true') {
      setRegistrationSuccess(true);
    }
  }, [router.query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      // Wait for the session to be fully established before redirecting
      setTimeout(() => {
        // Use replace instead of push and add a timestamp to prevent caching issues
        window.location.href = `/?t=${Date.now()}`;
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setIsLoading(false);
    }
  };

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
              <div className={styles.logoBox}>
                <div className={styles.logoIcon}>OW</div>
              </div>
              <h1 className={styles.brandName}>OptiWise</h1>
              <p className={styles.brandTagline}>AI-Powered Market Intelligence</p>
              <p className={styles.brandDescription}>
                Access real-time AI analysis and forecasting to make data-driven investment decisions.
              </p>
              
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FiBarChart size={14} />
                  </div>
                  <span className={styles.featureText}>
                    AI-Generated Full Analysis Reports with MOAT scoring
                  </span>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FiShield size={14} />
                  </div>
                  <span className={styles.featureText}>
                    Real-Time Global Market Updates and Financial News
                  </span>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FiCheck size={14} />
                  </div>
                  <span className={styles.featureText}>
                    MegaTrends Detection for long-term investment planning
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.graphic + ' ' + styles.circle1}></div>
            <div className={styles.graphic + ' ' + styles.circle2}></div>
            
            <div className={styles.testimonial}>
              <p className={styles.quote}>"OptiWise's AI analysis helped me identify undervalued stocks before they surged. The MegaTrends feature spotted the AI sector boom months ahead of the market."</p>
              <div className={styles.author}>
                <span className={styles.authorName}>— Mark Thompson</span>
                <span className={styles.authorTitle}>Portfolio Manager, Atlas Investments</span>
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Welcome back</h2>
                <p className={styles.formSubtitle}>Sign in to continue to OptiWise</p>
              </div>

              {registrationSuccess && (
                <div className={styles.successMessage}>
                  Account created successfully! Please sign in.
                </div>
              )}
              
              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>
                    Email
                  </label>
                  <div className={styles.inputWrapper}>
                    <FiMail className={styles.inputIcon} />
                    <input
                      id="email"
                      type="email"
                      className={styles.input}
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.labelFlex}>
                    <label htmlFor="password" className={styles.inputLabel}>
                      Password
                    </label>
                    <Link href="/forgot-password" className={styles.forgotLink}>
                      Forgot password?
                    </Link>
                  </div>
                  <div className={styles.inputWrapper}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      id="password"
                      type="password"
                      className={styles.input}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>Keep me signed in</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.loadingText}>
                      <div className={styles.spinner}></div>
                      Signing in...
                    </span>
                  ) : (
                    <span className={styles.buttonText}>
                      Sign in
                      <FiArrowRight className={styles.buttonIcon} />
                    </span>
                  )}
                </button>
              </form>

              <div className={styles.footerText}>
                Don't have an account?{' '}
                <Link href="/register" className={styles.footerLink}>
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
