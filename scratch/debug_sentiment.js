const axios = require('axios');

async function debugSentiment() {
    console.log('--- STARTING PURE-WIRE JSON INTERROGATION ---');
    try {
        const res = await axios.get('http://localhost:3000/api/sentiment');
        const data = res.data;
        if (!data.success) {
            console.log('FAIL: API returned success: false');
            return;
        }

        const assets = ['USOIL', 'AUD/USD', 'COPPER', 'EUR/USD'];
        assets.forEach(id => {
            const s = data.sentiment[id] || data.sentiment[id.replace('/', '')];
            if (s) {
                console.log(`[${id}]: ${s.longPct}% Long | Src: ${s.source}`);
            } else {
                console.log(`[${id}]: NOT FOUND IN API`);
            }
        });
    } catch (e) {
        console.log('ERROR hitting local API:', e.message);
    }
}

debugSentiment();
