const axios = require('axios');
const API_KEY = 'AIzaSyAvQe1cDgQr1VLzEpvNAcpmxFLk4D1lCjQ';

async function list() {
    try {
        const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        console.log('Models:', res.data.models.map(m => m.name));
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}
list();
