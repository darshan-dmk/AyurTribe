const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Mock process.env for this script
const envContent = fs.readFileSync(path.resolve(__dirname, './packages/api/.env'), 'utf-8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

async function testTranslation() {
    if (!apiKey) {
        console.error('No API key found');
        return;
    }
    console.log('Testing with API Key:', apiKey.substring(0, 5) + '...');
    const genAI = new GoogleGenerativeAI(apiKey);

    // Test multiple models
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];
    for (const m of models) {
        try {
            console.log(`Trying ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent('Translate "Hello World" to Kannada.');
            console.log(`${m} success:`, (await result.response).text().trim());
        } catch (e) {
            console.log(`${m} failed:`, e.message);
        }
    }
}

testTranslation();
