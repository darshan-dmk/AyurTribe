import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Models optimized for specific tasks
const TRANSLATION_MODEL = 'gemini-2.5-flash';
const CHAT_MODEL = 'gemini-3-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash';

const DATA_DIR = path.resolve(__dirname, '../../data/translations');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache map: Record<lang, Record<text, translation>>
let languageChunks: Record<string, Record<string, string>> = {};

const loadChunk = (lang: string) => {
    if (languageChunks[lang]) return;
    const chunkPath = path.join(DATA_DIR, `${lang}.json`);
    try {
        if (fs.existsSync(chunkPath)) {
            languageChunks[lang] = JSON.parse(fs.readFileSync(chunkPath, 'utf-8'));
        } else {
            languageChunks[lang] = {};
        }
    } catch (e) {
        console.warn(`[Translation] Failed to load chunk for ${lang}, starting fresh.`);
        languageChunks[lang] = {};
    }
};

const saveChunkToDisk = (lang: string) => {
    try {
        const chunkPath = path.join(DATA_DIR, `${lang}.json`);
        fs.writeFileSync(chunkPath, JSON.stringify(languageChunks[lang], null, 2));
    } catch (e) {
        console.error(`[Translation] Failed to save chunk for ${lang}:`, e);
    }
};

export const geminiService = {
    async translate(text: string, targetLang: string): Promise<string> {
        if (!text || !text.trim()) return text;

        loadChunk(targetLang);
        if (languageChunks[targetLang][text]) {
            return languageChunks[targetLang][text];
        }

        const results = await this.batchTranslate([text], targetLang);
        return results[0] || text;
    },

    async batchTranslate(texts: string[], targetLang: string): Promise<string[]> {
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
            console.error('Gemini API Key is missing');
            return texts;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const langName = this.getLangName(targetLang);

        loadChunk(targetLang);
        const langChunk = languageChunks[targetLang];

        // Filter out texts that are already in cache
        const results: string[] = new Array(texts.length).fill('');
        const missingIndexes: number[] = [];
        const missingTexts: string[] = [];

        texts.forEach((text, i) => {
            if (langChunk[text]) {
                results[i] = langChunk[text];
            } else {
                missingIndexes.push(i);
                missingTexts.push(text);
            }
        });

        if (missingTexts.length === 0) return results;

        const modelsToTry = [TRANSLATION_MODEL, FALLBACK_MODEL, 'gemini-pro'];
        let lastError: any = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[Translation] Batch translating ${missingTexts.length} items using ${modelName} to ${langName}...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                });

                // Complex batch prompt
                const prompt = `You are a professional Ayurvedic medical translator.
Translate the following ${missingTexts.length} English strings into ${langName}.
Keep the meaning precise for a healthcare context. 
Maintain all special characters, case, and placeholders.

Strings to translate:
${missingTexts.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

Format your response as a JSON array of strings:
["translation1", "translation2", ...]
Return ONLY the JSON array.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const responseText = response.text().trim();

                // Extract JSON if model returned markdown
                const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                const translations = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

                if (Array.isArray(translations) && translations.length === missingTexts.length) {
                    translations.forEach((trans, i) => {
                        const original = missingTexts[i];
                        const idx = missingIndexes[i];
                        results[idx] = trans;

                        // Update chunk
                        languageChunks[targetLang][original] = trans;
                    });

                    saveChunkToDisk(targetLang);
                    return results;
                }
            } catch (error: any) {
                lastError = error;
                console.warn(`[Translation] Model ${modelName} failed: ${error.message}`);
                continue;
            }
        }

        console.error('Gemini Batch Translation Failed:', lastError?.message);
        // Fallback for missing items
        missingIndexes.forEach((idx) => {
            if (!results[idx]) results[idx] = texts[idx];
        });
        return results;
    },

    async getLanguageBundle(lang: string): Promise<Record<string, string>> {
        loadChunk(lang);
        return languageChunks[lang] || {};
    },

    async chat(message: string, history: { role: 'user' | 'model', parts: string }[] = [], context: any = null): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) return "I'm sorry, but my AI core is currently disconnected.";

        let systemInstruction = `You are the AyurTribe AI Health Assistant, a digital Vaidya (Ayurvedic Physician). 
You are an expert in Ayurveda (Vata, Pitta, Kapha). 
Always be polite, nurturing, and professional. 
If a medical emergency is hinted at, recommend professional medical help immediately.`;

        if (context) {
            const { prakriti, medicalHistory, recentMetrics } = context;
            systemInstruction += `\n\nPATIENT CONTEXT:
- **Prakriti**: ${prakriti}
- **Medical History**: ${JSON.stringify(medicalHistory)}
- **Recent Health Metrics**: ${JSON.stringify(recentMetrics)}

Use this data to personalize your advice. If the user has a specific condition or Dosha dominant, mention how your suggestions relate to it. 
Be careful not to suggest herbs that might aggravate their specific imbalance or conflict with their medical history.`;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: CHAT_MODEL,
            systemInstruction,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const chatSession = model.startChat({
            history: history.map(h => ({ role: h.role, parts: [{ text: h.parts }] })),
            generationConfig: { maxOutputTokens: 1000 },
        });

        const result = await chatSession.sendMessage(message);
        return result.response.text();
    },

    async analyzeImage(imageBuffer: Buffer, mimeType: string, prompt: string, context: any = null): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) return "I cannot analyze images right now.";

        let systemInstruction = "Analyze this image in an Ayurvedic health context. Identify herbs, foods, or conditions shown and explain their properties in terms of Vata, Pitta, and Kapha.";

        if (context) {
            systemInstruction += `\n\nPATIENT CONTEXT:
- **Prakriti**: ${context.prakriti}
- **Medical History**: ${JSON.stringify(context.medicalHistory)}

Relate the image analysis specifically to how it affects this patient's Prakriti.`;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: CHAT_MODEL,
            systemInstruction,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        });

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: mimeType
                }
            }
        ]);

        return result.response.text();
    },

    getLangName(code: string): string {
        const mapping: Record<string, string> = {
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
        return mapping[code.toLowerCase()] || code;
    }
};
