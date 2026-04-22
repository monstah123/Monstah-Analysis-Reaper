import axios from 'axios';

async function globalSearch() {
    const ids = ['udgc-27he', 'srt6-5q2f', '72hh-3qpy'];
    const assets = ['DAX', 'NIKKEI', 'GOLD', 'BITCOIN', 'NASDAQ', 'SP 500', 'USOIL', 'WTI', 'BRENT', 'CRUDE OIL'];

    for (const asset of assets) {
        console.log(`Searching for ${asset}...`);
        for (const id of ids) {
            try {
                const res = await axios.get(`https://publicreporting.cftc.gov/resource/${id}.json?\$query=SELECT%20*%20WHERE%20market_and_exchange_names%20LIKE%20'%25${asset.replace(' ', '%20')}%25'%20ORDER%20BY%20report_date_as_yyyy_mm_dd%20DESC%20LIMIT%201`);
                if (res.data.length > 0) {
                    console.log(`  [Match in ${id}] ${res.data[0].market_and_exchange_names}`);
                }
            } catch (e) {}
        }
    }
}

globalSearch();
