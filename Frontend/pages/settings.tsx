import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaUser, FaPalette, FaBell, FaShieldAlt, FaCog } from 'react-icons/fa';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import styles from '../styles/Settings.module.css';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';


export default function Settings() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState('system');
  const [layout, setLayout] = useState('standard');
  
  useEffect(() => {
    if (user) {
      // Load user data from Supabase
      setEmail(user.email || '');
      
      // Set the fullName from user metadata
      const firstName = user.user_metadata?.first_name || '';
      const lastName = user.user_metadata?.last_name || '';
      setFullName(`${firstName} ${lastName}`.trim());
      
      // Load other user preferences from metadata or profile
      setTheme(user.user_metadata?.theme || 'system');
      setLayout(user.user_metadata?.layout || 'standard');
      
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
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: error.message || 'Error updating profile', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };
  
  const updateAppearance = async () => {
    setUpdating(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Update user preferences
      const { error } = await supabase.auth.updateUser({
        data: {
          theme,
          layout
        }
      });
      
      if (error) {
        throw error;
      }
      
      setMessage({ text: 'Appearance settings updated successfully', type: 'success' });
    } catch (error) {
      console.error('Error updating appearance:', error);
      setMessage({ text: error.message || 'Error updating appearance settings', type: 'error' });
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
    } catch (error) {
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
          <title>Settings - OptiWise</title>
          <meta name="description" content="Manage your OptiWise account settings" />
        </Head>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading your settings...</p>
          </div>
        ) : (
          <div className={styles.settingsContainer}>
            <div className={styles.sidebar}>
              <h2 className={styles.sidebarTitle}>Settings</h2>
              <ul className={styles.sidebarMenu}>
                <li 
                  className={`${styles.sidebarItem} ${activeTab === 'profile' ? styles.active : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FaUser className={styles.sidebarIcon} />
                  <span>Profile</span>
                </li>
                <li 
                  className={`${styles.sidebarItem} ${activeTab === 'appearance' ? styles.active : ''}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <FaPalette className={styles.sidebarIcon} />
                  <span>Appearance</span>
                </li>
                <li 
                  className={`${styles.sidebarItem} ${activeTab === 'notifications' ? styles.active : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FaBell className={styles.sidebarIcon} />
                  <span>Notifications</span>
                </li>
                <li 
                  className={`${styles.sidebarItem} ${activeTab === 'privacy' ? styles.active : ''}`}
                  onClick={() => setActiveTab('privacy')}
                >
                  <FaShieldAlt className={styles.sidebarIcon} />
                  <span>Privacy & Security</span>
                </li>
                <li 
                  className={`${styles.sidebarItem} ${activeTab === 'account' ? styles.active : ''}`}
                  onClick={() => setActiveTab('account')}
                >
                  <FaCog className={styles.sidebarIcon} />
                  <span>Account</span>
                </li>
                <li 
                  className={`${styles.sidebarItem} ${styles.signOutItem}`}
                  onClick={handleSignOut}
                >
                  <FaCog className={styles.sidebarIcon} />
                  <span>Sign Out</span>
                </li>
              </ul>
            </div>
            
            <div className={styles.contentArea}>
              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}
              
              {activeTab === 'profile' && (
                <div className={styles.settingsSection}>
                  <h1 className={styles.sectionTitle}>Profile Settings</h1>
                                    
                  <div className={styles.formGroup}>
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                      type="text" 
                      id="fullName" 
                      className={styles.input} 
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className={styles.input} 
                      placeholder="Your email address"
                      value={email}
                      disabled
                    />
                    <p className={styles.inputHelp}>Contact support to change your email address</p>
                  </div>
                  
                  <button 
                    className={styles.saveButton}
                    onClick={updateProfile}
                    disabled={updating}
                  >
                    {updating ? (
                      <span className={styles.buttonContent}>
                        <div className={styles.buttonSpinner}></div>
                        Saving...
                      </span>
                    ) : (
                      <span className={styles.buttonContent}>
                        <FiSave className={styles.buttonIcon} />
                        Save Changes
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              {activeTab === 'appearance' && (
                <div className={styles.settingsSection}>
                  <h1 className={styles.sectionTitle}>Appearance Settings</h1>
                  
                  <div className={styles.settingBlock}>
                    <h3>Theme</h3>
                    <div className={styles.themeOptions}>
                      <div className={styles.themeOption}>
                        <input 
                          type="radio" 
                          id="lightTheme" 
                          name="theme" 
                          value="light"
                          checked={theme === 'light'}
                          onChange={() => setTheme('light')}
                        />
                        <label htmlFor="lightTheme">Light</label>
                      </div>
                      <div className={styles.themeOption}>
                        <input 
                          type="radio" 
                          id="darkTheme" 
                          name="theme" 
                          value="dark"
                          checked={theme === 'dark'}
                          onChange={() => setTheme('dark')}
                        />
                        <label htmlFor="darkTheme">Dark</label>
                      </div>
                      <div className={styles.themeOption}>
                        <input 
                          type="radio" 
                          id="systemTheme" 
                          name="theme" 
                          value="system"
                          checked={theme === 'system'}
                          onChange={() => setTheme('system')}
                        />
                        <label htmlFor="systemTheme">System Default</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.settingBlock}>
                    <h3>Layout</h3>
                    <div className={styles.formGroup}>
                      <select 
                        className={styles.select}
                        value={layout}
                        onChange={(e) => setLayout(e.target.value)}
                      >
                        <option value="compact">Compact</option>
                        <option value="standard">Standard</option>
                        <option value="comfortable">Comfortable</option>
                      </select>
                    </div>
                  </div>
                  
                  <button 
                    className={styles.saveButton}
                    onClick={updateAppearance}
                    disabled={updating}
                  >
                    {updating ? (
                      <span className={styles.buttonContent}>
                        <div className={styles.buttonSpinner}></div>
                        Saving...
                      </span>
                    ) : (
                      <span className={styles.buttonContent}>
                        <FiSave className={styles.buttonIcon} />
                        Save Changes
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className={styles.settingsSection}>
                  <h1 className={styles.sectionTitle}>Notification Settings</h1>
                  
                  <div className={styles.toggleGroup}>
                    <div className={styles.toggleItem}>
                      <div>
                        <h3>Email Notifications</h3>
                        <p>Receive emails about account activity</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                    
                    <div className={styles.toggleItem}>
                      <div>
                        <h3>Push Notifications</h3>
                        <p>Receive push notifications in the browser</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                    
                    <div className={styles.toggleItem}>
                      <div>
                        <h3>Trade Alerts</h3>
                        <p>Get notified about important market changes</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" defaultChecked />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                    
                    <div className={styles.toggleItem}>
                      <div>
                        <h3>Newsletter</h3>
                        <p>Receive weekly updates and tips</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <button className={styles.saveButton}>
                    <span className={styles.buttonContent}>
                      <FiSave className={styles.buttonIcon} />
                      Save Changes
                    </span>
                  </button>
                </div>
              )}
              
              {activeTab === 'privacy' && (
                <div className={styles.settingsSection}>
                  <h1 className={styles.sectionTitle}>Privacy & Security Settings</h1>
                  
                  <div className={styles.toggleGroup}>
                    <div className={styles.toggleItem}>
                      <div>
                        <h3>Two-Factor Authentication</h3>
                        <p>Enhance your account security</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                    
                    <div className={styles.toggleItem}>
                      <div>
                        <h3>Public Profile</h3>
                        <p>Allow other users to view your profile</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" />
                        <span className={styles.slider}></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className={styles.settingBlock}>
                    <h3>Session Management</h3>
                    <p>You're currently logged in on these devices</p>
                    
                    <div className={styles.sessionsList}>
                      <div className={styles.sessionItem}>
                        <div>
                          <h4>Current Browser</h4>
                          <p>Last active: Now</p>
                        </div>
                        <span className={styles.activeBadge}>Current</span>
                      </div>
                      
                      <div className={styles.sessionItem}>
                        <div>
                          <h4>iPhone 12 - Safari</h4>
                          <p>Last active: 2 days ago</p>
                        </div>
                        <button className={styles.revokeButton}>Revoke</button>
                      </div>
                    </div>
                    
                    <button className={styles.dangerButton}>Log Out Of All Sessions</button>
                  </div>
                </div>
              )}
              
              {activeTab === 'account' && (
                <div className={styles.settingsSection}>
                  <h1 className={styles.sectionTitle}>Account Settings</h1>
                  
                  <div className={styles.settingBlock}>
                    <h3>Change Password</h3>
                    <p>We'll send a password reset link to your email</p>
                    
                    <button 
                      className={styles.secondaryButton}
                      onClick={changePassword}
                    >
                      <span className={styles.buttonContent}>
                        <FiRefreshCw className={styles.buttonIcon} />
                        Reset Password
                      </span>
                    </button>
                  </div>
                  
                  <div className={styles.dangerZone}>
                    <h3>Danger Zone</h3>
                    <p>Once you delete your account, there is no going back. Please be certain.</p>
                    <button className={styles.dangerButton}>Delete Account</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}