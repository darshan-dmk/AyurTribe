import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/common.json';

const resources = {
    en: { translation: en },
    hi: { translation: {} },
    kn: { translation: {} },
    te: { translation: {} },
    ta: { translation: {} },
    ml: { translation: {} },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('ayurtribe_language') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
