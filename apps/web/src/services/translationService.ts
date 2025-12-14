import axios from 'axios';

// Indian Languages
export const INDIAN_LANGUAGES = [
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'ur', name: 'Urdu (اردو)' }
];

// Global Languages
export const GLOBAL_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish (Español)' },
    { code: 'fr', name: 'French (Français)' },
    { code: 'de', name: 'German (Deutsch)' },
    { code: 'ar', name: 'Arabic (العربية)' },
    { code: 'zh', name: 'Chinese (中文)' }
];

export const SUPPORTED_LANGUAGES = [
    ...GLOBAL_LANGUAGES,
    ...INDIAN_LANGUAGES
];

const CACHE_KEY_PREFIX = 'ayurtribe_i18n_v1_';
const API_URL = 'https://libretranslate.com/translate'; // Fallback public mirror
// Alternative mirrors:
// https://translate.terraprint.co/translate
// https://lt.vern.cc/translate

interface TranslationCache {
    [key: string]: string;
}

class TranslationService {
    private cache: TranslationCache = {};
    private pendingRequests: Map<string, Promise<string>> = new Map();

    constructor() {
        this.loadCache();
    }

    private loadCache() {
        try {
            const saved = localStorage.getItem(CACHE_KEY_PREFIX + 'main');
            if (saved) {
                this.cache = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load translation cache', e);
        }
    }

    private saveCache() {
        try {
            localStorage.setItem(CACHE_KEY_PREFIX + 'main', JSON.stringify(this.cache));
        } catch (e) {
            console.warn('Failed to save translation cache', e);
        }
    }

    private getCacheKey(text: string, targetLang: string): string {
        return `${targetLang}|${text.trim()}`;
    }

    async translateText(text: string, targetLang: string): Promise<string> {
        if (!text || !text.trim()) return text;
        if (targetLang === 'en') return text; // Base language

        const cacheKey = this.getCacheKey(text, targetLang);

        // 1. Check Memory/Local Storage Cache
        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }

        // 2. Check Pending Requests (Deduplication)
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey)!;
        }

        // 3. API Call
        const promise = this.performTranslation(text, targetLang)
            .then(translated => {
                this.cache[cacheKey] = translated;
                this.saveCache();
                this.pendingRequests.delete(cacheKey);
                return translated;
            })
            .catch(err => {
                console.error(`Translation failed for "${text}" to ${targetLang}`, err);
                this.pendingRequests.delete(cacheKey);
                return text; // Fallback to original
            });

        this.pendingRequests.set(cacheKey, promise);
        return promise;
    }

    private async performTranslation(text: string, targetLang: string): Promise<string> {
        try {
            // Small random delay to avoid hitting rate limits instantly if multiple components mount
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

            const response = await axios.post(API_URL, {
                q: text,
                source: 'en',
                target: targetLang,
                format: 'text'
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000 // 5s timeout
            });

            return response.data.translatedText;
        } catch (error) {
            // If primary mirror fails, log it. Real app should try valid failover mirrors.
            throw error;
        }
    }

    // Batch translation helper (LibreTranslate supports batch 'q' as array)
    async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
        if (targetLang === 'en') return texts;

        const uncachedIndices: number[] = [];
        const uncachedTexts: string[] = [];
        const results: string[] = new Array(texts.length).fill('');

        // 1. Fill from cache
        texts.forEach((text, index) => {
            const key = this.getCacheKey(text, targetLang);
            if (this.cache[key]) {
                results[index] = this.cache[key];
            } else {
                uncachedIndices.push(index);
                uncachedTexts.push(text);
            }
        });

        if (uncachedTexts.length === 0) return results;

        // 2. Fetch missing
        try {
            // Note: Not all LibreTranslate mirrors enable batching by default.
            // We'll stick to sequential parallel for better compatibility with strict mirrors
            // or implement true batching if server supports it.
            // For safety/compatibility, we map to single calls here:
            const newTranslations = await Promise.all(
                uncachedTexts.map(t => this.translateText(t, targetLang))
            );

            newTranslations.forEach((trans, i) => {
                results[uncachedIndices[i]] = trans;
            });

            return results;
        } catch (error) {
            console.error('Batch translation failed', error);
            return texts; // Fallback
        }
    }
}

export const translationService = new TranslationService();

// Translation service singleton for app-wide use
