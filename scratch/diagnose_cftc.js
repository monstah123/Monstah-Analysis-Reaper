import axios from 'axios';

async function diagnose() {
    const ids = ['udgc-27he', 'srt6-5q2f', '72hh-3qpy'];
    
    for (const id of ids) {
        console.log(`\n--- Diagnosing ${id} ---`);
        const res = await axios.get(`https://publicreporting.cftc.gov/resource/${id}.json?$limit=100`);
        const data = res.data;
        
        const assets = ['YEN', 'ETHER', 'BRENT', 'GOLD', 'EURO'];
        
        for (const asset of assets) {
            const match = data.find(r => 
                (r.market_and_exchange_names || r.market_name || '').toUpperCase().includes(asset)
            );
            
            if (match) {
                console.log(`Found ${asset} in ${id}: ${match.market_and_exchange_names || match.market_name}`);
                console.log(`Keys: ${Object.keys(match).filter(k => k.includes('long') || k.includes('short')).join(', ')}`);
                console.log(`Asset Mgr Long: ${match.asset_mgr_positions_long}, Short: ${match.asset_mgr_positions_short}`);
            } else {
                console.log(`NOT Found ${asset} in ${id}`);
            }
        }
    }
}

diagnose();
