import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AppProps } from 'next/app';
import { supabase } from '../utils/supabaseClient';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      // Eğer kullanıcı yoksa ve korunmuş bir sayfadaysa login'e yönlendir
      const protectedRoutes = ['/dashboard', '/profile', '/settings'];
      if (!user && protectedRoutes.includes(router.pathname)) {
        router.replace('/login');
      }
    };
    
    checkUser();
    
    // Oturum durumunu dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        if (!['/login', '/register', '/forgot-password'].includes(router.pathname)) {
          router.replace('/login');
        }
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);
  
  if (loading) return <div>Loading...</div>; // Yetkilendirme kontrolü tamamlanmadan yüklenmeyi göster
  
  return <Component {...pageProps} />;
}

export default MyApp;