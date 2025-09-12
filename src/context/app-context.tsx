
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
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient) return;

    const activeUserCode = sessionStorage.getItem('activeUser');
    if (activeUserCode) {
       getUser(activeUserCode)
        .then((user) => {
            if(user) {
              setUser(user);
              if (pathname === '/') {
                router.replace('/dashboard');
              }
            } else {
              // User in session storage not found in db
              logout();
            }
        })
        .catch(() => logout())
        .finally(() => setIsLoading(false));
    } else {
       setIsLoading(false);
       if (pathname !== '/') {
         router.replace('/');
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, pathname, router]);

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
  
  const logout = () => {
    sessionStorage.removeItem('activeUser');
    setUser(null);
    setIsLoading(false);
    router.push('/');
  };

  const value = { user, language, setLanguage, loginAs, logout };

  if (!isClient || isLoading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
             <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )
  }

  if (!user && pathname !== '/') {
    // If not logged in and not on the login page, show loading while redirecting
     return (
        <div className="flex h-screen w-screen items-center justify-center">
             <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )
  }
  
  if (user && pathname === '/') {
    // If logged in and on the login page, show loading while redirecting
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
