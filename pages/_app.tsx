import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { AppProps } from 'next/app'
import { supabase } from '../utils/supabaseClient'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [initializedAuth, setInitializedAuth] = useState(false)
  
  useEffect(() => {
    // One-time auth check and setup (prevents redirect loops)
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setInitializedAuth(true)
      } catch (error) {
        console.error("Auth initialization error:", error)
        setInitializedAuth(true) // Set to true even on error to avoid hanging
      }
    }
    
    initAuth()
    
    // Set up auth state listener but only for sign out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          // Only redirect to login if not already on a public page
          if (!router.pathname.startsWith('/login') && 
              !router.pathname.startsWith('/register') &&
              !router.pathname.startsWith('/forgot-password')) {
            router.replace('/login')
          }
        }
        // Removed SIGNED_IN handling - let login page handle the redirect
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [router])
  
  return <Component {...pageProps} />
}

export default MyApp
