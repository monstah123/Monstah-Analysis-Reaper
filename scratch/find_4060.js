import axios from 'axios';

async function find4060() {
    const urls = [
        '6dca-aqww', // TFF
        'srt6-5q2f', // Legacy
        'gpe5-46if', // Supp
        '927n-8qpw', // TFF Comb
        'jun7-fc8e', // Legacy Comb
        '72hh-3qpy'  // Supp Comb
    ];

    for (const id of urls) {
        try {
            console.log(`Checking ${id}...`);
            const res = await axios.get(`https://publicreporting.cftc.gov/resource/${id}.json?\$query=SELECT%20*%20WHERE%20market_and_exchange_names%20LIKE%20'%25BRITISH%20POUND%25'%20ORDER%20BY%20report_date_as_yyyy_mm_dd%20DESC%20LIMIT%201`);
            const row = res.data[0];
            if (row) {
                console.log(`Match in ${id}:`, row.market_and_exchange_names);
                for (const [k, v] of Object.entries(row)) {
                    if (k.includes('long') || k.includes('short')) {
                        console.log(`  ${k}: ${v}`);
                    }
                }
                // Try to find a 40/60 split
                const longs = Object.entries(row).filter(([k,v]) => k.includes('long'));
                const shorts = Object.entries(row).filter(([k,v]) => k.includes('short'));
                for (const [lk, lv] of longs) {
                    for (const [sk, sv] of shorts) {
                        const l = parseFloat(lv);
                        const s = parseFloat(sv);
                        if (l > 0 && s > 0) {
                            const pct = Math.round((l / (l + s)) * 100);
                            if (pct >= 38 && pct <= 42) {
                                console.log(`  >>> FOUND 40/60! Long: ${lk}(${lv}), Short: ${sk}(${sv}), Pct: ${pct}%`);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log(`Error ${id}:`, e.message);
        }
    }
}

find4060();
