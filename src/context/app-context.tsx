
'use client';

import { getUser } from '@/lib/data';
import type { User } from '@/lib/types';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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
        .then((user) => {
            if(user) setUser(user);
        })
        .catch(() => {
            sessionStorage.removeItem('activeUser');
            setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
       setIsLoading(false);
       if (pathname !== '/') {
         router.push('/');
       }
    }
  }, [pathname, router]);

  React.useEffect(() => {
      if (!isLoading) {
          if (user && pathname === '/') {
              router.push('/dashboard');
          } else if (!user && pathname !== '/') {
              router.push('/');
          }
      }
  }, [user, pathname, isLoading, router]);

  const loginAs = async (userCode: string) => {
    const newUser = await getUser(userCode);
    if (newUser) {
      sessionStorage.setItem('activeUser', userCode);
      setUser(newUser);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    sessionStorage.removeItem('activeUser');
    setUser(null);
    router.push('/');
  };

  const value = { user, language, setLanguage, loginAs, logout };
  
  const isAuthPage = pathname === '/';

  if (isLoading || (!user && !isAuthPage) || (user && isAuthPage)) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
             <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )
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

    