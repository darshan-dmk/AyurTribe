const { GoogleGenerativeAI } = require('@google/generative-ai');
const API_KEY = 'AIzaSyAvQe1cDgQr1VLzEpvNAcpmxFLk4D1lCjQ';
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        console.log('Gemini Response:', response.text());
    } catch (err) {
        console.error('Gemini Error:', err.message);
    }
}
test();
