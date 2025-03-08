import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  FiUser, FiSettings, FiLogOut, FiShield, 
  FiMail, FiLock, FiEdit, FiSave, FiRefreshCw
} from 'react-icons/fi';
import styles from '../styles/Account.module.css';
import { supabase } from '../utils/supabaseClient';

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  const router = useRouter();
  
  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      setEmail(user.email || '');
      
      // Fetch additional user data from profiles table if you have one
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setFullName(data.full_name || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      
      setLoading(false);
    };
    
    getUserProfile();
  }, [router]);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setMessage({ text: 'Error signing out. Please try again.', type: 'error' });
    }
  };
  
  const updateProfile = async () => {
    setUpdating(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Update profile data in your profiles table
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Error updating profile. Please try again.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };
  
  const changePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      setMessage({ text: 'Password reset email sent. Please check your inbox.', type: 'success' });
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ text: 'Error resetting password. Please try again.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your account...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Account | OptiWise</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

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
            </div>
            
            <button className={styles.signOutButton} onClick={handleSignOut}>
              <FiLogOut className={styles.signOutIcon} />
              <span>Sign Out</span>
            </button>
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
    </>
  );
};

export default Account;
