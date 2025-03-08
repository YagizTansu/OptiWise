import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import styles from '../styles/ResetPassword.module.css';
import { supabase } from '../utils/supabaseClient';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset password email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password | OptiWise</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.page}>
        <div className={styles.formContainer}>
          <div className={styles.logoBox}>
            <div className={styles.logoIcon}>OW</div>
          </div>

          {success ? (
            <div className={styles.successContainer}>
              <h1 className={styles.formTitle}>Check your email</h1>
              <p className={styles.formSubtitle}>
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <Link href="/login" className={styles.button}>
                <span className={styles.buttonText}>
                  Return to login
                  <FiArrowRight className={styles.buttonIcon} />
                </span>
              </Link>
            </div>
          ) : (
            <>
              <h1 className={styles.formTitle}>Reset your password</h1>
              <p className={styles.formSubtitle}>
                Enter the email address associated with your account, and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.inputLabel}>Email address</label>
                  <div className={styles.inputWrapper}>
                    <FiMail className={styles.inputIcon} />
                    <input
                      id="email"
                      type="email"
                      className={styles.input}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.loadingText}>
                      <div className={styles.spinner}></div>
                      Sending reset link...
                    </span>
                  ) : (
                    <span className={styles.buttonText}>
                      Reset password
                      <FiArrowRight className={styles.buttonIcon} />
                    </span>
                  )}
                </button>
              </form>

              <div className={styles.footerText}>
                Remember your password?{' '}
                <Link href="/login" className={styles.footerLink}>
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
