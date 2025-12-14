import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize with default 'en' resources to prevent crash before loading dynamic
const resources = {
    en: {
        translation: {}
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('ayurtribe_language') || 'en', // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss
        },
        react: {
            useSuspense: false // Handle loading manually for smoother UX
        }
    });

export default i18n;
