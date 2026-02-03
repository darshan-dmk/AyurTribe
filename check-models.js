const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './packages/api/.env' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('No API key found in packages/api/.env');
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // There isn't a direct listModels in the SDK easily for some versions, 
        // but we can try to hit a known model.
        // Actually, let's try to just use Gemini 1.5 Flash as a safe bet if 2.0 fails.
        console.log('API Key starts with:', apiKey.substring(0, 5));

        const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent('Hi');
                console.log(`Model ${m} is available.`);
            } catch (e) {
                console.log(`Model ${m} is NOT available: ${e.message}`);
            }
        }
    } catch (e) {
        console.error('Error listing models:', e);
    }
}

listModels();
