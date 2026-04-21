
const axios = require('axios');

async function test() {
    const urls = [
        'https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=5&$order=report_date_as_yyyy_mm_dd DESC',
        'https://publicreporting.cftc.gov/resource/jun7-fc8e.json?$limit=5&$order=report_date_as_yyyy_mm_dd DESC',
        'https://publicreporting.cftc.gov/resource/927n-8qpw.json?$limit=5&$order=report_date_as_yyyy_mm_dd DESC'
    ];

    for (const url of urls) {
        try {
            const res = await axios.get(url);
            console.log(`URL: ${url}`);
            console.log(`Status: ${res.status}`);
            console.log(`Data Count: ${res.data.length}`);
            if (res.data.length > 0) {
                console.log(`First row Keys: ${Object.keys(res.data[0]).join(', ')}`);
                console.log(`First row Name: ${res.data[0].market_and_exchange_names}`);
            }
        } catch (e) {
            console.log(`URL: ${url} FAILED: ${e.message}`);
        }
    }
}

test();
