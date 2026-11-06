import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, format } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('lh_lang') || 'ko';
  });

  const setLang = (newLang) => {
    if (newLang === 'ko' || newLang === 'en') {
      setLangState(newLang);
      localStorage.setItem('lh_lang', newLang);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'ko' ? 'en' : 'ko');
  };

  const t = (path, params = {}) => {
    const keys = path.split('.');
    let current = translations[lang];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to Korean if key is missing
        let fallback = translations.ko;
        for (const fKey of keys) {
          if (fallback && fallback[fKey] !== undefined) {
            fallback = fallback[fKey];
          } else {
            return path;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current === 'string') {
      return format(current, params);
    }
    return current;
  };

  const strings = translations[lang] || translations.ko;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, strings }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
