
'use client';

import { getUser } from '@/lib/data';
import type { User } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();

  React.useEffect(() => {
    const activeUserCode = sessionStorage.getItem('activeUser');
    if (activeUserCode && activeUserCode !== 'loggedOut') {
       getUser(activeUserCode)
        .then(setUser)
        .catch(() => {
            sessionStorage.removeItem('activeUser');
            setUser(null);
            router.push('/');
        })
        .finally(() => setIsLoading(false));
    } else {
       setIsLoading(false);
       // If not logged in and not on the root (login) page, redirect there.
       if (pathname !== '/') {
        router.push('/');
       }
    }
  }, [router, pathname]);

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
    router.push('/');
  };

  const value = { user, language, setLanguage, loginAs, logout };
  
  // If we are loading authentication state, don't render children to avoid flickers
  if (isLoading) {
    return null;
  }
  
  // If not logged in and not on the login page, wait for redirect
  if (!user && pathname !== '/') {
    return null;
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
