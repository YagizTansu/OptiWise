import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  FiUser, FiSettings, FiLogOut, FiShield, 
  FiMail, FiLock, FiEdit, FiSave, FiRefreshCw
} from 'react-icons/fi';
import styles from '../styles/Account.module.css';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { supabase } from '../lib/supabase';

import Layout from '../components/Layout'

const Account = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  const router = useRouter();
  
  useEffect(() => {
    if (user) {
      // Load user data from Supabase
      setEmail(user.email || '');
      
      // Set the fullName from user metadata
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      setFullName(`${firstName} ${lastName}`.trim());
      
      setLoading(false);
    }
  }, [user]);
  
  const updateProfile = async () => {
    setUpdating(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Split full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName
        }
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ text: error.message || 'Error updating profile', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };
  
  const changePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setMessage({ text: 'Password reset email sent. Please check your inbox.', type: 'success' });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setMessage({ text: error.message || 'Error resetting password. Please try again.', type: 'error' });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Router redirect is handled in the signOut function in AuthContext
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ProtectedRoute>
          <Layout>

      <Head>
        <title>My Account | OptiWise</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your account...</p>
        </div>
      ) : (
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.sidePanel}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <FiUser size={30} />
                </div>
                <div className={styles.userDetails}>
                  <h3 className={styles.userName}>{fullName || 'User'}</h3>
                  <p className={styles.userEmail}>{email}</p>
                </div>
              </div>
              
              <div className={styles.menuItems}>
                <button 
                  className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`} 
                  onClick={() => setActiveTab('profile')}
                >
                  <FiUser className={styles.menuIcon} />
                  <span>Profile</span>
                </button>
                
                <button 
                  className={`${styles.menuItem} ${activeTab === 'security' ? styles.active : ''}`} 
                  onClick={() => setActiveTab('security')}
                >
                  <FiShield className={styles.menuIcon} />
                  <span>Security</span>
                </button>
                
                <button 
                  className={`${styles.menuItem} ${activeTab === 'settings' ? styles.active : ''}`} 
                  onClick={() => setActiveTab('settings')}
                >
                  <FiSettings className={styles.menuIcon} />
                  <span>Settings</span>
                </button>
                
                <button 
                  className={`${styles.menuItem} ${styles.logoutItem}`} 
                  onClick={handleSignOut}
                >
                  <FiLogOut className={styles.menuIcon} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            
            <div className={styles.mainContent}>
              <div className={styles.contentHeader}>
                <h2 className={styles.contentTitle}>
                  {activeTab === 'profile' && 'My Profile'}
                  {activeTab === 'security' && 'Security Settings'}
                  {activeTab === 'settings' && 'Account Settings'}
                </h2>
              </div>
              
              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}
              
              {activeTab === 'profile' && (
                <div className={styles.formSection}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Full Name</label>
                    <div className={styles.inputWrapper}>
                      <FiUser className={styles.inputIcon} />
                      <input
                        type="text"
                        className={styles.input}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email Address</label>
                    <div className={styles.inputWrapper}>
                      <FiMail className={styles.inputIcon} />
                      <input
                        type="email"
                        className={styles.input}
                        value={email}
                        disabled
                        placeholder="Your email"
                      />
                    </div>
                    <p className={styles.inputHelp}>Contact support to change your email address</p>
                  </div>
                  
                  <button 
                    className={styles.button}
                    onClick={updateProfile}
                    disabled={updating}
                  >
                    {updating ? (
                      <span className={styles.buttonText}>
                        <div className={styles.spinner}></div>
                        Updating...
                      </span>
                    ) : (
                      <span className={styles.buttonText}>
                        <FiSave className={styles.buttonIcon} />
                        Save Changes
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className={styles.formSection}>
                  <div className={styles.securityCard}>
                    <div className={styles.securityCardHeader}>
                      <FiLock className={styles.securityIcon} />
                      <h3>Password</h3>
                    </div>
                    <p className={styles.securityText}>
                      Change your password to keep your account secure.
                    </p>
                    <button 
                      className={styles.secondaryButton}
                      onClick={changePassword}
                    >
                      <FiRefreshCw className={styles.buttonIcon} />
                      Reset Password
                    </button>
                  </div>
                  
                  <div className={styles.securityCard}>
                    <div className={styles.securityCardHeader}>
                      <FiShield className={styles.securityIcon} />
                      <h3>Two-Factor Authentication</h3>
                    </div>
                    <p className={styles.securityText}>
                      Add an extra layer of security to your account.
                    </p>
                    <button className={styles.secondaryButton}>
                      <FiEdit className={styles.buttonIcon} />
                      Setup 2FA
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className={styles.formSection}>
                  <div className={styles.settingsCard}>
                    <h3 className={styles.settingsTitle}>Notification Preferences</h3>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkbox} defaultChecked />
                        <span className={styles.checkboxText}>Email notifications</span>
                      </label>
                    </div>
                    
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkbox} defaultChecked />
                        <span className={styles.checkboxText}>Market alerts</span>
                      </label>
                    </div>
                    
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkbox} />
                        <span className={styles.checkboxText}>Newsletter</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.dangerZone}>
                    <h3 className={styles.dangerTitle}>Danger Zone</h3>
                    <p className={styles.dangerText}>
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className={styles.dangerButton}>
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
          </Layout>

    </ProtectedRoute>
  );
};

export default Account;
