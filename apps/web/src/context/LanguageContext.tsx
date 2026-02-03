import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translationService } from '../services/translationService';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (langCode: string) => Promise<void>;
  t: (key: string, options?: any) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to flatten nested object for easier translation batching
const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
  return Object.keys(obj).reduce((acc: any, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

// Helper to unflatten back into nested object
const unflattenObject = (data: Record<string, string>): any => {
  const result: any = {};
  for (const i in data) {
    const keys = i.split('.');
    keys.reduce((r, a, j) => {
      return r[a] || (r[a] = keys.length - 1 === j ? data[i] : {});
    }, result);
  }
  return result;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('ayurtribe_language');
    if (savedLang && savedLang !== i18n.language) {
      // If it's not English, we might need to load it again if it was not in resources
      // But for now, just set it and let changeLanguage handle the fetch if needed
      i18n.changeLanguage(savedLang);
      setCurrentLanguage(savedLang);
    }
  }, [i18n]);

  const changeLanguage = async (langCode: string) => {
    if (langCode === currentLanguage) return;

    setIsTranslating(true);

    try {
      // 1. Try to fetch the entire language chunk/bundle first
      const existingResource = i18n.getResourceBundle(langCode, 'translation');
      const isAlreadyLoaded = existingResource && Object.keys(existingResource).length > 10; // Simple check if it's more than just an empty shell

      if (!isAlreadyLoaded && langCode !== 'en') {
        const remoteBundle = await translationService.getBundle(langCode);

        const enBundle = i18n.getResourceBundle('en', 'translation');
        if (enBundle) {
          const flattened = flattenObject(enBundle);
          const keys = Object.keys(flattened);
          const values = Object.values(flattened);

          // We check if the remote bundle provided translations for our known keys
          // If not (e.g., new UI elements), we'll translate them now.
          const finalFlat: Record<string, string> = {};
          const keysToTranslate: string[] = [];
          const valuesToTranslate: string[] = [];
          const missingKeyIndexes: number[] = [];

          keys.forEach((key, idx) => {
            const originalText = values[idx] as string;
            // The bundle uses originalText as key
            if (remoteBundle && remoteBundle[originalText]) {
              finalFlat[key] = remoteBundle[originalText];
            } else {
              keysToTranslate.push(key);
              valuesToTranslate.push(originalText);
              missingKeyIndexes.push(idx);
            }
          });

          // 2. Translate only what's missing from the bundle
          if (valuesToTranslate.length > 0) {
            console.log(`[LanguageContext] Bundle missing ${valuesToTranslate.length} keys, translating now...`);
            const CHUNK_SIZE = 40;
            for (let i = 0; i < valuesToTranslate.length; i += CHUNK_SIZE) {
              const chunk = valuesToTranslate.slice(i, i + CHUNK_SIZE);
              const translatedChunk = await Promise.all(
                chunk.map(text => translationService.translateText(text, langCode))
              );
              translatedChunk.forEach((trans, idx) => {
                const globalIdx = i + idx;
                finalFlat[keysToTranslate[globalIdx]] = trans;
              });
            }
          }

          const translatedBundle = unflattenObject(finalFlat);
          i18n.addResourceBundle(langCode, 'translation', translatedBundle, true, true);
        }
      }

      await i18n.changeLanguage(langCode);
      setCurrentLanguage(langCode);
      localStorage.setItem('ayurtribe_language', langCode);
    } catch (error) {
      console.error('[LanguageContext] Translation failed:', error);
      // Fallback to English but still set the state so UI doesn't hang
      await i18n.changeLanguage('en');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t, isTranslating }}>
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

export const Trans: React.FC<{ children: string }> = ({ children }) => {
  const { t } = useLanguage();
  return <>{t(children)}</>;
};
