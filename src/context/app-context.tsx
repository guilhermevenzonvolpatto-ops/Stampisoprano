

'use client';

import { getUser } from '@/lib/data';
import type { User } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import en from '@/locales/en.json';
import it from '@/locales/it.json';

type Locale = 'en' | 'it';
type Translations = typeof en;

const translations = { en, it };

type AppContextType = {
  user: User | null;
  language: Locale;
  setLanguage: (lang: Locale) => void;
  loginAs: (userCode: string) => Promise<boolean>;
  logout: () => void;
  t: (key: keyof Translations) => string;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

function FullPageSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [language, setLanguage] = React.useState<Locale>('en');
  const [isLoading, setIsLoading] = React.useState(true); // Start in loading state
  const router = useRouter();
  const pathname = usePathname();
  
  const logout = React.useCallback(() => {
    sessionStorage.removeItem('activeUser');
    localStorage.removeItem('language');
    setUser(null);
    if (pathname !== '/') {
        router.push('/');
    }
  }, [router, pathname]);

  React.useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && (storedLang === 'en' || storedLang === 'it')) {
      setLanguage(storedLang);
    }

    const activeUserCode = sessionStorage.getItem('activeUser');
    if (activeUserCode) {
      getUser(activeUserCode)
        .then((user) => {
          if (user) {
            setUser(user);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [logout]);
  
  React.useEffect(() => {
      if (!isLoading) {
          if (user && pathname === '/') {
              router.replace('/dashboard');
          } else if (!user && pathname !== '/') {
              router.replace('/');
          }
      }
  }, [user, isLoading, pathname, router])


  const loginAs = async (userCode: string) => {
    const newUser = await getUser(userCode);
    if (newUser) {
      sessionStorage.setItem('activeUser', userCode);
      setUser(newUser);
      router.push('/dashboard');
      return true;
    }
    return false;
  };

  const handleSetLanguage = (lang: Locale) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }

  const t = (key: keyof Translations) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const value = { user, language, setLanguage: handleSetLanguage, loginAs, logout, t };

  if (isLoading) {
      return <FullPageSpinner />;
  }

  if (!user && pathname !== '/') {
    return <FullPageSpinner />;
  }

  if (user && pathname === '/') {
    return <FullPageSpinner />;
  }

  return (
    <AppContext.Provider value={value}>
        <html lang={language} suppressHydrationWarning>
            {children}
        </html>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
