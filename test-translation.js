const axios = require('axios');
async function test() {
    try {
        const res = await axios.post('http://localhost:4000/api/translation/translate', {
            text: 'Welcome to Ayurtribe',
            targetLang: 'hi'
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}
test();
