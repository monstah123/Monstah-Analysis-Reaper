const match1 = { "asset_mgr_positions_long": 13171, "asset_mgr_positions_long_other": 0, "traders_asset_mgr_long_all": 9 };
const match2 = { "noncomm_positions_long_all": 227701, "noncomm_positions_long_old": 227701, "noncomm_positions_long_other": 0, "traders_noncomm_long_all": 162 };

for (const match of [match1, match2]) {
    for (const p of ['asset_mgr', 'noncomm']) {
        let l = 0, s = 0;
        for (const key of Object.keys(match)) {
            const k = key.toLowerCase();
            if (k.includes(p) && !k.includes('change') && !k.includes('pct') && !k.includes('spread') && !k.includes('traders') && !k.includes('old') && !k.toLowerCase().endsWith('other')) {
                const val = parseInt(match[key] || 0) || 0;
                if (k.includes('long')) l = val;
                if (k.includes('short')) s = val;
            }
        }
        if (l) console.log(`Matched ${p} long:`, l);
    }
}
