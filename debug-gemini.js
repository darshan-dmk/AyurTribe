const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Load env from packages/api/.env
const envPath = path.resolve(__dirname, 'packages/api/.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath, override: true });

console.log('All process.env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
const API_KEY = process.env.GEMINI_API_KEY || '';
console.log('Parsed GEMINI_API_KEY from process.env:', API_KEY);

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = 'gemini-1.5-flash';

async function test() {
    const text = 'Welcome to Ayurtribe';
    const targetLang = 'hi';
    const langName = 'Hindi';

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const prompt = `Translate this text to ${langName} for an Ayurvedic medical app. Keep formatting exactly as is.
    Text: "${text}"
    Return ONLY the translated text without any explanations or formatting.`;

        console.log('Prompting Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text().trim();
        console.log('Gemini Response:', translatedText);
    } catch (err) {
        console.error('Gemini Error Details:');
        console.error('Message:', err.message);
        if (err.status) console.error('Status:', err.status);
        if (err.response) console.error('Response:', err.response);
    }
}
test();
