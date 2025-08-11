"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
  languages: Language[];
}

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    nativeName: "English"
  },
  {
    code: "fr",
    name: "French",
    flag: "🇫🇷",
    nativeName: "Français"
  }
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const pathname = usePathname();

  useEffect(() => {
    // Extract language from pathname
    const pathSegments = pathname.split('/');
    const langFromPath = pathSegments[1];
    
    const foundLanguage = languages.find(lang => lang.code === langFromPath);
    if (foundLanguage) {
      setCurrentLanguage(foundLanguage);
    } else {
      // Default to English if no language in path
      setCurrentLanguage(languages[0]);
    }
  }, [pathname]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 