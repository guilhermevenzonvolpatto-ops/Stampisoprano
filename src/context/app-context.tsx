
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

function FullPageSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [language, setLanguage] = React.useState<'en' | 'it'>('en');
  const [isLoading, setIsLoading] = React.useState(true); // Start in loading state
  const router = useRouter();
  const pathname = usePathname();
  
  const logout = React.useCallback(() => {
    sessionStorage.removeItem('activeUser');
    setUser(null);
    if (pathname !== '/') {
        router.push('/');
    }
  }, [router, pathname]);


  React.useEffect(() => {
    const activeUserCode = sessionStorage.getItem('activeUser');
    if (activeUserCode) {
      getUser(activeUserCode)
        .then((user) => {
          if (user) {
            setUser(user);
          } else {
            // User in session storage not found in db, so log out
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
      // No user in session storage
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

  const value = { user, language, setLanguage, loginAs, logout };

  if (isLoading) {
      return <FullPageSpinner />;
  }

  // Prevent flicker on initial load / redirect
  if (!user && pathname !== '/') {
    return <FullPageSpinner />;
  }

  if (user && pathname === '/') {
    return <FullPageSpinner />;
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
