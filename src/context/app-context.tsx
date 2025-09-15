

'use client';

import { getUser, getComponentsForMold, getMolds, getMachines } from '@/lib/data';
import type { User, Component, Mold, Machine } from '@/lib/types';
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

  const processUserPermissions = React.useCallback(async (baseUser: User): Promise<User> => {
    if (baseUser.isAdmin || !baseUser.allowedCodes) {
      return baseUser;
    }

    const allMolds = await getMolds();
    const allComponents = await getComponents();
    const allMachines = await getMachines();

    const expandedCodes = new Set(baseUser.allowedCodes);

    // 1. Find all molds the user has DIRECT access to
    const allowedMolds = allMolds.filter(mold => baseUser.allowedCodes.includes(mold.codice));

    // 2. For each allowed mold, add its associated components and machine to the allowed list
    for (const mold of allowedMolds) {
      // Add associated machine
      if (mold.macchinaAssociata) {
        expandedCodes.add(mold.macchinaAssociata);
      }
      
      // Find components produced by this mold and add them
      const componentsForMold = allComponents.filter(c => c.associatedMolds?.includes(mold.id));
      for (const component of componentsForMold) {
        expandedCodes.add(component.codice);
      }
    }

    return {
      ...baseUser,
      allowedCodes: Array.from(expandedCodes),
    };
  }, []);

  React.useEffect(() => {
    const activeUserCode = sessionStorage.getItem('activeUser');
    if (activeUserCode) {
      getUser(activeUserCode)
        .then(async (baseUser) => {
          if (baseUser) {
            const processedUser = await processUserPermissions(baseUser);
            setUser(processedUser);
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
    
    const storedLang = localStorage.getItem('language') as Locale | null;
    if (storedLang && ['en', 'it'].includes(storedLang)) {
      setLanguage(storedLang);
      if (document.documentElement) {
        document.documentElement.lang = storedLang;
      }
    }
  }, [logout, processUserPermissions]);
  
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
    const baseUser = await getUser(userCode);
    if (baseUser) {
      const processedUser = await processUserPermissions(baseUser);
      sessionStorage.setItem('activeUser', userCode);
      setUser(processedUser);
      return true;
    }
    return false;
  };

  const handleSetLanguage = (lang: Locale) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    if (document.documentElement) {
      document.documentElement.lang = lang;
    }
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
        {children}
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
