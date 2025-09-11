
'use client';

import { getUser } from '@/lib/data';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import * as React from 'react';

type AppContextType = {
  user: User | null;
  language: 'en' | 'it';
  setLanguage: (lang: 'en' | 'it') => void;
  loginAs: (userCode: string) => Promise<boolean>;
  logout: () => void;
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [language, setLanguage] = React.useState<'en' | 'it'>('en');
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const activeUserCode = sessionStorage.getItem('activeUser');
    if (activeUserCode && activeUserCode !== 'loggedOut') {
       getUser(activeUserCode)
        .then(setUser)
        .catch(() => {
            // If user lookup fails, clear the bad session data and redirect to login
            sessionStorage.removeItem('activeUser');
            setUser(null);
            router.push('/login');
        })
        .finally(() => setIsLoading(false));
    } else {
       setIsLoading(false);
       if (window.location.pathname !== '/login') {
        router.push('/login');
       }
    }
  }, [router]);

  const loginAs = async (userCode: string) => {
    setIsLoading(true);
    const newUser = await getUser(userCode);
    if (newUser) {
      sessionStorage.setItem('activeUser', userCode);
      setUser(newUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };
  
  const logout = () => {
    sessionStorage.setItem('activeUser', 'loggedOut');
    setUser(null);
    router.push('/login');
  };

  const value = { user, language, setLanguage, loginAs, logout };
  
  if (isLoading) {
    return null; // or a loading spinner
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
