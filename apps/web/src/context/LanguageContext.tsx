import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import i18n from '../i18n';
import { translationService, SUPPORTED_LANGUAGES } from '../services/translationService';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (langCode: string) => Promise<void>;
  isTranslating: boolean;
  t: (text: string) => string; // Smart translate helper
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Smart dynamic dictionary for the current session
  const [dictionary, setDictionary] = useState<Record<string, string>>({});
  const [translationVersion, setTranslationVersion] = useState(0); // Force re-renders

  useEffect(() => {
    // Sync with i18n on mount
    const savedLang = localStorage.getItem('ayurtribe_language');
    if (savedLang && savedLang !== currentLanguage) {
      changeLanguage(savedLang);
    }
  }, []);

  const changeLanguage = async (langCode: string) => {
    setIsTranslating(true);
    try {
      await i18n.changeLanguage(langCode);
      setCurrentLanguage(langCode);
      localStorage.setItem('ayurtribe_language', langCode);
      setDictionary({}); // Clear session dictionary on switch to force refresh
      setTranslationVersion(v => v + 1); // Force re-render
    } catch (err) {
      console.error('Language switch failed', err);
    } finally {
      setTimeout(() => setIsTranslating(false), 500); // Small delay for UI smoothness
    }
  };

  // Smart Translation Hook Logic
  // This function takes english text, checks cache/dictionary, triggers translation if missing
  const t = useCallback((text: string): string => {
    if (!text) return '';
    if (currentLanguage === 'en') return text;

    // Check session dictionary first (fastest)
    if (dictionary[text]) return dictionary[text];

    // If not found, trigger translation and update dictionary
    translationService.translateText(text, currentLanguage).then((translated: string) => {
      if (translated && translated !== text && !dictionary[text]) {
        setDictionary(prev => ({ ...prev, [text]: translated }));
        setTranslationVersion(v => v + 1); // Force components to re-render
      }
    }).catch((err: Error) => {
      console.error(`Translation failed for "${text}"`, err);
    });

    return text; // Return English while loading
  }, [currentLanguage, dictionary, translationVersion]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, isTranslating, t }}>
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

// Component wrapper for auto-translating text
export const Trans: React.FC<{ children: string }> = ({ children }) => {
  const { t, currentLanguage } = useLanguage();
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    if (currentLanguage === 'en') {
      setTranslated(children);
      return;
    }

    let active = true;
    translationService.translateText(children, currentLanguage).then((res: string) => {
      if (active) setTranslated(res);
    });

    return () => { active = false; };
  }, [children, currentLanguage]);

  return <>{translated}</>;
};
