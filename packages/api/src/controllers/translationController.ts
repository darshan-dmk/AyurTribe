import { Request, Response } from 'express';
import { geminiService } from '../services/geminiService';

export const translateText = async (req: Request, res: Response) => {
    try {
        const { text, targetLang } = req.body;

        if (!text || !targetLang) {
            return res.status(400).json({ error: 'Missing text or targetLang' });
        }

        if (targetLang.toLowerCase() === 'en' || targetLang.toLowerCase() === 'english') {
            return res.json({ translatedText: text });
        }

        const translatedText = await geminiService.translate(text, targetLang);
        return res.json({ translatedText });

    } catch (error: any) {
        console.error('Translation error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const batchTranslateText = async (req: Request, res: Response) => {
    try {
        const { texts, targetLang } = req.body;

        if (!Array.isArray(texts) || !targetLang) {
            return res.status(400).json({ error: 'Missing texts array or targetLang' });
        }

        if (targetLang.toLowerCase() === 'en' || targetLang.toLowerCase() === 'english') {
            return res.json({ translations: texts });
        }

        const translations = await geminiService.batchTranslate(texts, targetLang);
        return res.json({ translations });

    } catch (error: any) {
        console.error('Batch translation error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const getLanguageBundle = async (req: Request, res: Response) => {
    try {
        const { lang } = req.params;

        if (!lang) {
            return res.status(400).json({ error: 'Missing language parameter' });
        }

        const bundle = await geminiService.getLanguageBundle(lang);
        return res.json({ bundle });

    } catch (error: any) {
        console.error('Get bundle error:', error);
        return res.status(500).json({ error: error.message });
    }
};
