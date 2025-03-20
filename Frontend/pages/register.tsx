import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { FiUser, FiMail, FiLock, FiArrowRight, FiCheck, FiClock, FiUsers } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import styles from '../styles/Register.module.css';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await signUp(
        formData.email, 
        formData.password,
        formData.firstName,
        formData.lastName
      );
      
      if (error) {
        setError(error.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }
      
      // Redirect to login with success message
      router.push('/login?registered=true');
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message || 'Failed to sign up with Google');
        setIsLoading(false);
        return;
      }
      // If successful, the user will be redirected to the OAuth provider
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account | OptiWise</title>
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
              <p className={styles.brandTagline}>Forecaster AI Agent</p>
              <p className={styles.brandDescription}>
                Join investors using our AI-powered platform to identify opportunities and reduce risk through intelligent market analysis.
              </p>
              
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FiClock size={14} />
                  </div>
                  <span className={styles.featureText}>
                    Insider Transactions Tracking and Regulatory Alerts
                  </span>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FiUsers size={14} />
                  </div>
                  <span className={styles.featureText}>
                    Financial Health Assessment with Altman Z-Score
                  </span>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FiCheck size={14} />
                  </div>
                  <span className={styles.featureText}>
                    Personalized AI Investment Recommendations
                  </span>
                </div>
              </div>
            </div>
            
            <div className={styles.graphic + ' ' + styles.circle1}></div>
            <div className={styles.graphic + ' ' + styles.circle2}></div>
            
            <div className={styles.testimonial}>
              <p className={styles.quote}>"The AI alerts saved me from a major loss by flagging insider selling before earnings. OptiWise's MOAT scoring system has transformed how I evaluate company fundamentals."</p>
              <div className={styles.author}>
                <span className={styles.authorName}>— Rebecca Chen</span>
                <span className={styles.authorTitle}>Private Investor, Former Goldman Sachs</span>
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Create your account</h2>
                <p className={styles.formSubtitle}>Join OptiWise to streamline your work</p>
              </div>

              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}

              <button 
                onClick={handleGoogleSignUp} 
                className={`${styles.button} ${styles.googleButton}`}
                disabled={isLoading}
                type="button"
              >
                <FcGoogle className={styles.buttonIcon} />
                <span>Sign up with Google</span>
              </button>

              <div className={styles.separator}>
                <span className={styles.separatorText}>or</span>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.nameInputs}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="firstName" className={styles.inputLabel}>First name</label>
                    <div className={styles.inputWrapper}>
                      <FiUser className={styles.inputIcon} />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className={styles.input}
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        autoComplete="given-name"
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="lastName" className={styles.inputLabel}>Last name</label>
                    <div className={styles.inputWrapper}>
                      <FiUser className={styles.inputIcon} />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className={styles.input}
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>Email</label>
                  <div className={styles.inputWrapper}>
                    <FiMail className={styles.inputIcon} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={styles.input}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.inputLabel}>Password</label>
                  <div className={styles.inputWrapper}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      className={styles.input}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.inputLabel}>Confirm password</label>
                  <div className={styles.inputWrapper}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className={styles.input}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className={styles.termsContainer}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                    />
                    <span className={styles.checkboxText}>
                      I agree to the{' '}
                      <Link href="/terms" className={styles.termsLink}>Terms of Service</Link>{' '}
                      and{' '}
                      <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link>
                    </span>
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
                      Creating account...
                    </span>
                  ) : (
                    <span className={styles.buttonText}>
                      Create account
                      <FiArrowRight className={styles.buttonIcon} />
                    </span>
                  )}
                </button>
              </form>

              <div className={styles.footerText}>
                Already have an account?{' '}
                <Link href="/login" className={styles.footerLink}>
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
