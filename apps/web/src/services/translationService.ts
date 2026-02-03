import api from '../utils/api';
// Indian Languages Mapping for IndicTrans2 (FLORES-200 codes) - Keeping for reference
export const INDIC_LANG_MAPPING: { [key: string]: string } = {
    'en': 'English',
    'hi': 'Hindi',
    'kn': 'Kannada',
    'te': 'Telugu',
    'ta': 'Tamil',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'pa': 'Punjabi',
    'or': 'Odia'
};

// Supported Languages (Expanded to all major Indian languages)
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'ml', name: 'Malayalam (മലയാളം)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' }
];

export const GLOBAL_LANGUAGES: any[] = [];


// apps/web/src/services/translationService.ts



const CACHE_KEY_PREFIX = 'ayurtribe_indic_v1_';

// Configuration
// Adapted for Create React App (process.env) instead of Vite (import.meta.env)
// const API_URL = process.env.REACT_APP_TRANSLATION_API_URL || 'https://api.dhruva.ai4bharat.org/services/inference/translation';
// const API_KEY = process.env.REACT_APP_TRANSLATION_API_KEY || '';

interface TranslationCache {
    [key: string]: string;
}

class TranslationService {
    private cache: TranslationCache = {};
    private pendingRequests: Map<string, Promise<string>> = new Map();
    private batchBuffer: Map<string, Array<{ text: string, resolve: (val: string) => void, reject: (err: any) => void }>> = new Map();
    private batchTimeout: NodeJS.Timeout | null = null;

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
        const safeText = String(text || '').trim();
        return `${targetLang}|${safeText}`;
    }

    async translateText(text: any, targetLang: string): Promise<string> {
        if (typeof text !== 'string') {
            console.warn('[TranslationService] Attempted to translate non-string value:', text);
            return String(text || '');
        }
        if (!text || !text.trim()) return text;
        if (targetLang === 'en') return text;

        // Check if language is supported by IndicTrans2 mapping
        if (!INDIC_LANG_MAPPING[targetLang] && !GLOBAL_LANGUAGES.find(l => l.code === targetLang)) {
            console.warn(`Language ${targetLang} not supported by configuration.`);
            return text;
        }

        const cacheKey = this.getCacheKey(text, targetLang);

        // 1. Check Cache
        if (this.cache[cacheKey]) return this.cache[cacheKey];

        // 2. Check Pending
        if (this.pendingRequests.has(cacheKey)) return this.pendingRequests.get(cacheKey)!;

        // 3. Buffer for batching
        const promise = new Promise<string>((resolve, reject) => {
            if (!this.batchBuffer.has(targetLang)) {
                this.batchBuffer.set(targetLang, []);
            }
            this.batchBuffer.get(targetLang)!.push({ text, resolve, reject });

            if (!this.batchTimeout) {
                this.batchTimeout = setTimeout(() => this.flushBatch(), 150);
            }
        }).then(translated => {
            // IMPORTANT: Only cache if the translation actually changed things 
            // or if it's very likely a correct translation (differs from original)
            if (translated && translated !== text) {
                this.cache[cacheKey] = translated;
                this.saveCache();
            }
            this.pendingRequests.delete(cacheKey);
            return translated;
        }).catch(err => {
            console.error(`Translation failed for "${text}" to ${targetLang}`, err);
            this.pendingRequests.delete(cacheKey);
            return text;
        });

        this.pendingRequests.set(cacheKey, promise);
        return promise;
    }

    private async flushBatch() {
        // ... (existing code omitted for brevity in chunking, but I'll keep it)
        this.batchTimeout = null;
        const currentBatches = Array.from(this.batchBuffer.entries());
        this.batchBuffer.clear();

        for (const [targetLang, requests] of currentBatches) {
            try {
                const texts = requests.map(r => r.text);
                await new Promise(resolve => setTimeout(resolve, 300));

                const response: any = await api.post('/translation/batch-translate', {
                    texts,
                    targetLang,
                    sourceLang: 'en'
                });

                if (response && Array.isArray(response.translations)) {
                    response.translations.forEach((trans: string, idx: number) => {
                        const indicTarget = INDIC_LANG_MAPPING[targetLang];
                        let cleanedTrans = trans;
                        if (indicTarget) {
                            cleanedTrans = cleanedTrans.replace('eng_Latn', '').replace(indicTarget, '').trim();
                        }
                        requests[idx].resolve(cleanedTrans || texts[idx]);
                    });
                } else {
                    console.warn('Unknown batch translation response format', response);
                    requests.forEach(r => r.resolve(r.text));
                }
            } catch (error) {
                console.error('Batch translation failed', error);
                requests.forEach(r => r.resolve(r.text));
            }
        }
    }

    /**
     * Fetches the entire pre-calculated bundle for a language
     */
    async getBundle(lang: string): Promise<Record<string, string>> {
        if (lang === 'en') return {};
        try {
            const response: any = await api.get(`/translation/bundle/${lang}`);
            if (response && response.bundle) {
                // Merge into local cache for performance
                Object.entries(response.bundle as Record<string, string>).forEach(([text, trans]) => {
                    const key = this.getCacheKey(text, lang);
                    this.cache[key] = trans;
                });
                this.saveCache();
                return response.bundle;
            }
            return {};
        } catch (error) {
            console.error(`Failed to fetch bundle for ${lang}`, error);
            return {};
        }
    }
}

export const translationService = new TranslationService();
