import React, { createContext, useContext, useState, useEffect } from 'react';
import { ar } from '../translations/ar';
import { en } from '../translations/en';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'ar');
  const [t, setT] = useState(language === 'ar' ? ar : en);

  useEffect(() => {
    localStorage.setItem('language', language);
    setT(language === 'ar' ? ar : en);
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const value = {
    language,
    t,
    toggleLanguage,
    isRTL: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
