import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { FiMail, FiLock, FiArrowRight, FiCheck, FiShield, FiBarChart } from 'react-icons/fi';
import styles from '../styles/Login.module.css';

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();

  // Check for registration success in query params
  useEffect(() => {
    if (router.query.registered === 'true') {
      setRegistrationSuccess(true);
    }
  }, [router.query]);



  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    throw new Error('Function not implemented.');
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
              <h1 className={styles.brandName}>OptiWise</h1>
              <p className={styles.brandTagline}>AI-Powered Market Intelligence</p>
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
