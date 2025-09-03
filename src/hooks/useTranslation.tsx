
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import gu from '@/locales/gu.json';
import pa from '@/locales/pa.json';
import bn from '@/locales/bn.json';
import as from '@/locales/as.json';
import brx from '@/locales/brx.json';
import dgo from '@/locales/dgo.json';
import kn from '@/locales/kn.json';
import ks from '@/locales/ks.json';
import kok from '@/locales/kok.json';
import mai from '@/locales/mai.json';
import ml from '@/locales/ml.json';
import mni from '@/locales/mni.json';
import mr from '@/locales/mr.json';
import ne from '@/locales/ne.json';
import or from '@/locales/or.json';
import sa from '@/locales/sa.json';
import sat from '@/locales/sat.json';
import sd from '@/locales/sd.json';
import ta from '@/locales/ta.json';
import te from '@/locales/te.json';
import ur from '@/locales/ur.json';

const translations = { en, hi, gu, pa, bn, as, brx, dgo, kn, ks, kok, mai, ml, mni, mr, ne, or, sa, sat, sd, ta, te, ur };
const RTL_LANGUAGES = ['ur', 'ks', 'sd'];

type Language = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get nested keys
const getNestedTranslation = (language: Language, key: string): string | undefined => {
    return key.split('.').reduce((obj: any, k: string) => {
        return obj?.[k];
    }, translations[language]);
};


export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('eKheti-lang') as Language;
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
    } else {
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      } else {
        setLanguageState('hi'); // Default to Hindi
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('eKheti-lang', lang);
    setLanguageState(lang);
    if (RTL_LANGUAGES.includes(lang)) {
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.dir = 'ltr';
    }
  };

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    const translation = getNestedTranslation(language, key);
    
    if (translation === undefined) {
      console.warn(`Translation key '${key}' not found for language '${language}', falling back to English.`);
      const fallbackTranslation = getNestedTranslation('en', key);
      
      if (fallbackTranslation === undefined) {
        console.error(`Fallback translation key '${key}' not found in English.`);
        return key;
      }
      
      if (options) {
        return Object.keys(options).reduce((acc, k) => acc.replace(`{{${k}}}`, String(options[k])), fallbackTranslation);
      }
      return fallbackTranslation;
    }
    
    if (options) {
      return Object.keys(options).reduce((acc, k) => acc.replace(`{{${k}}}`, String(options[k])), translation);
    }

    return translation;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <html lang={language} dir={RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'} suppressHydrationWarning>
        {children}
      </html>
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
