
import axios from 'axios';

async function diagnose() {
    const ids = ['udgc-27he', 'srt6-5q2f', '72hh-3qpy'];
    for (const id of ids) {
        console.log(`Checking ${id}...`);
        try {
            const res = await axios.get(`https://publicreporting.cftc.gov/resource/${id}.json?$limit=50&$order=report_date_as_yyyy_mm_dd DESC`);
            console.log(`First 2 names in ${id}:`);
            res.data.slice(0, 2).forEach(r => {
                console.log(` - ${r.market_and_exchange_names || r.market_name || r.contract_market_name}`);
            });
        } catch (e) {
            console.error(`Error ${id}: ${e.message}`);
        }
    }
}

diagnose();
