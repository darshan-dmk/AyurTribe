
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAvQe1cDgQr1VLzEpvNAcpmxFLk4D1lCjQ';
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        console.log("Fetching models...");
        // Not all SDK versions expose listModels cleanly on the root, 
        // usually it's genAI.getGenerativeModel... but listing is via API directly often.
        // Actually the SDK doesn't always have a public listModels method.
        // Let's try to just use 'gemini-1.5-flash-latest' or 'gemini-1.0-pro'.

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent("Hello");
        console.log("1.5-flash Success:", await result.response.text());
    } catch (e: any) {
        console.error("1.5-flash Failed:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro Success:", await result.response.text());
    } catch (e: any) {
        console.error("gemini-pro Failed:", e.message);
    }
}

listModels();
