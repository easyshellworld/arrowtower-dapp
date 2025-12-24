"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionary, Locale } from './dictionaries';

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 默认使用英文，实际项目中可以从 localStorage 读取
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // 尝试从 localStorage 读取用户偏好
    const savedLocale = localStorage.getItem('arrowtower-locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('arrowtower-locale', newLocale);
  };

  // 简单的翻译函数，支持 nested keys 如 "home.title"
  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = dictionary[locale];
    
    for (const k of keys) {
      if (current[k] === undefined) {
        console.warn(`Missing translation for key: ${key} in locale: ${locale}`);
        return key;
      }
      current = current[k];
    }
    
    return current as string;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

