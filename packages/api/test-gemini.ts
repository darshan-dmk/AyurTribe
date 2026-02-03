
import dotenv from 'dotenv';
import { geminiService } from './src/services/geminiService';

dotenv.config();

async function testGemini() {
    console.log("Testing Gemini Translation...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);

    const input = { value: "Welcome to AyurTribe" };
    const target = "Hindi";

    try {
        const result = await geminiService.translateJSON(input, target);
        console.log("Input:", input);
        console.log("Target:", target);
        console.log("Result:", result);
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testGemini();
