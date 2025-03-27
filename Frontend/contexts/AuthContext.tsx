import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signInWithGoogle: () => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to update user metadata if needed
  const updateUserWithGoogleData = async (session: Session) => {
    if (!session?.user) return;
    
    try {
      
      // Check if we have Google auth data with name information
      const googleData = session.user.identities?.find(
        identity => identity.provider === 'google'
      );
      
      // Check if user metadata already has name information
      const hasExistingName = session.user.user_metadata?.first_name && 
                            session.user.user_metadata?.last_name;
      
      
      // If we have Google data with name info and no existing name in metadata, update it
      if (googleData?.identity_data && !hasExistingName) {
        const { name, full_name, email } = googleData.identity_data;
        
        
        // Extract first and last name
        let firstName = '';
        let lastName = '';
        
        if (full_name) {
          const nameParts = full_name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        } else if (name) {
          const nameParts = name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        
        if (firstName || lastName) {
          
          const { data, error } = await supabase.auth.updateUser({
            data: {
              first_name: firstName,
              last_name: lastName
            }
          });
          
          if (error) {
            console.error('Error updating user metadata:', error);
          } else {
            
            // Refresh the session to get updated user metadata
            const { data: { session: refreshedSession } } = await supabase.auth.getSession();
            if (refreshedSession) {
              setSession(refreshedSession);
              setUser(refreshedSession.user);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in updateUserWithGoogleData:', error);
    }
  };

  // Handle URL hash params for OAuth redirect
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      // Check if this is a redirect from OAuth (Google)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        setIsLoading(true);
        
        // Let Supabase handle the OAuth redirect
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session after OAuth redirect:', error);
        } else if (data?.session) {
          await updateUserWithGoogleData(data.session);
        }
        
        setIsLoading(false);
      }
    };
    
    handleOAuthRedirect();
  }, []);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await updateUserWithGoogleData(session);
      }
      
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    };

    getSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      setSession(session);
      setUser(session?.user || null);
      
      // If this is a sign-in event with a session, update user data from Google if needed
      if (event === 'SIGNED_IN' && session) {
        // Add slight delay to ensure Google data is available
        setTimeout(async () => {
          await updateUserWithGoogleData(session);
        }, 500);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      return { data, error };
    } catch (error) {
      return { error, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { data, error };
    } catch (error) {
      return { error, data: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      return { data, error };
    } catch (error) {
      return { error, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
