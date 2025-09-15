

'use client';

import { getUser, getComponentsForMold, getMolds, getMachines, getComponents } from '@/lib/data';
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
  
    const expandedCodes = new Set(baseUser.allowedCodes);
  
    // Create maps for efficient lookups
    const componentMap = new Map(allComponents.map(c => [c.id, c]));
    const moldMap = new Map(allMolds.map(m => [m.id, m]));
  
    // First pass: add direct associations
    for (const code of baseUser.allowedCodes) {
      // If code is for a mold
      const mold = allMolds.find(m => m.codice === code);
      if (mold) {
        if (mold.macchinaAssociata) expandedCodes.add(mold.macchinaAssociata);
        const componentsForMold = allComponents.filter(c => c.associatedMolds?.includes(mold.id));
        componentsForMold.forEach(c => expandedCodes.add(c.codice));
      }
  
      // If code is for a component
      const component = allComponents.find(c => c.codice === code);
      if (component && component.associatedMolds) {
        component.associatedMolds.forEach(moldId => {
          const associatedMold = moldMap.get(moldId);
          if (associatedMold) {
            expandedCodes.add(associatedMold.codice);
            if (associatedMold.macchinaAssociata) {
              expandedCodes.add(associatedMold.macchinaAssociata);
            }
          }
        });
      }
    }
  
    // Second pass: handle nested associations (mold -> component -> other molds)
    // This ensures that if you have access to one mold, you get its components,
    // and if those components are used in OTHER molds, you get access to those too.
    const currentCodes = Array.from(expandedCodes);
    for (const code of currentCodes) {
      const component = allComponents.find(c => c.codice === code);
      if (component && component.associatedMolds) {
        component.associatedMolds.forEach(moldId => {
          const associatedMold = moldMap.get(moldId);
          if (associatedMold) {
            expandedCodes.add(associatedMold.codice);
             if (associatedMold.macchinaAssociata) {
              expandedCodes.add(associatedMold.macchinaAssociata);
            }
          }
        });
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
