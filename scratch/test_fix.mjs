/**
 * Quick verification: Test the XRATE exclusion and MICRO deprioritization fix
 * against live CFTC SODA API data
 */
import https from 'https';

const fetchJSON = (url) => new Promise((resolve, reject) => {
  https.get(url, { timeout: 15000 }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(e); } });
  }).on('error', reject);
});

async function test() {
  const keywords = ['BRITISH POUND', 'JAPANESE YEN', 'DJIA'];
  const where = keywords.map(k => `upper(market_and_exchange_names) like '%25${k.toUpperCase().replace(/ /g, '%20')}%25'`).join(' or ');
  const url = `https://publicreporting.cftc.gov/resource/udgc-27he.json?$where=${where}&$limit=50&$order=report_date_as_yyyy_mm_dd DESC`;
  
  const rawData = await fetchJSON(url);
  
  console.log('\n=== BEFORE FIX (raw matches) ===');
  for (const asset of ['BRITISH POUND', 'JAPANESE YEN', 'DJIA']) {
    const matches = rawData.filter(r => r.market_and_exchange_names?.toUpperCase().includes(asset));
    const top = matches[0];
    if (top) {
      console.log(`\n${asset}:`);
      console.log(`  Contract: ${top.market_and_exchange_names}`);
      console.log(`  asset_mgr L/S: ${top.asset_mgr_positions_long} / ${top.asset_mgr_positions_short}`);
      console.log(`  lev_money L/S: ${top.lev_money_positions_long} / ${top.lev_money_positions_short}`);
    }
  }

  console.log('\n\n=== AFTER FIX (filtered) ===');
  
  // GBP: Exclude XRATE
  const gbpAll = rawData.filter(r => r.market_and_exchange_names?.toUpperCase().includes('BRITISH POUND'));
  const gbpFiltered = gbpAll.filter(r => {
    const name = r.market_and_exchange_names.toUpperCase();
    return !name.includes('XRATE') && !name.includes('/');
  });
  const gbp = gbpFiltered[0];
  console.log(`\nGBPUSD (after XRATE exclusion):`);
  console.log(`  Contract: ${gbp?.market_and_exchange_names}`);
  console.log(`  asset_mgr L/S: ${gbp?.asset_mgr_positions_long} / ${gbp?.asset_mgr_positions_short}`);
  console.log(`  lev_money L/S: ${gbp?.lev_money_positions_long} / ${gbp?.lev_money_positions_short}`);
  
  // JPY: Exclude XRATE
  const jpyAll = rawData.filter(r => r.market_and_exchange_names?.toUpperCase().includes('JAPANESE YEN'));
  const jpyFiltered = jpyAll.filter(r => {
    const name = r.market_and_exchange_names.toUpperCase();
    return !name.includes('XRATE') && !name.includes('/');
  });
  const jpy = jpyFiltered[0];
  console.log(`\nUSDJPY (after XRATE exclusion):`);
  console.log(`  Contract: ${jpy?.market_and_exchange_names}`);
  console.log(`  asset_mgr L/S: ${jpy?.asset_mgr_positions_long} / ${jpy?.asset_mgr_positions_short}`);
  console.log(`  lev_money L/S: ${jpy?.lev_money_positions_long} / ${jpy?.lev_money_positions_short}`);
  
  // US30: Exclude MICRO
  const djiaAll = rawData.filter(r => r.market_and_exchange_names?.toUpperCase().includes('DJIA'));
  const djiaFiltered = djiaAll.filter(r => {
    const name = r.market_and_exchange_names.toUpperCase();
    return !name.includes('MICRO');
  });
  // Sort: prefer Consolidated, then by volume
  djiaFiltered.sort((a, b) => {
    const dateA = new Date(a.report_date_as_yyyy_mm_dd).getTime();
    const dateB = new Date(b.report_date_as_yyyy_mm_dd).getTime();
    if (dateB !== dateA) return dateB - dateA;
    const nA = a.market_and_exchange_names.toUpperCase();
    const nB = b.market_and_exchange_names.toUpperCase();
    if (nA.includes('CONSOLIDATED') && !nB.includes('CONSOLIDATED')) return -1;
    if (nB.includes('CONSOLIDATED') && !nA.includes('CONSOLIDATED')) return 1;
    return 0;
  });
  const djia = djiaFiltered[0];
  console.log(`\nUS30 (after MICRO exclusion):`);
  console.log(`  Contract: ${djia?.market_and_exchange_names}`);
  console.log(`  asset_mgr L/S: ${djia?.asset_mgr_positions_long} / ${djia?.asset_mgr_positions_short}`);
  console.log(`  lev_money L/S: ${djia?.lev_money_positions_long} / ${djia?.lev_money_positions_short}`);

  // Calculate actual percentages
  const getMax = (row, patterns, dir) => {
    let max = 0;
    for (const p of patterns) {
      for (const key of Object.keys(row)) {
        const k = key.toLowerCase();
        if (k.includes(p) && k.includes(dir) && !k.includes('change') && !k.includes('pct') && !k.includes('spread')) {
          const val = parseInt(row[key] || 0);
          if (!isNaN(val) && val > max) max = val;
        }
      }
    }
    return max;
  };
  
  const instPatterns = ['asset_mgr', 'm_money', 'managed_money', 'lev_money', 'noncomm'];
  
  console.log('\n\n=== FINAL SENTIMENT PERCENTAGES ===');
  for (const [label, row] of [['GBP/USD', gbp], ['USD/JPY', jpy], ['US30', djia]]) {
    if (!row) { console.log(`${label}: NO DATA`); continue; }
    const l = getMax(row, instPatterns, 'long');
    const s = getMax(row, instPatterns, 'short');
    const total = l + s;
    let longPct = total > 0 ? (l / total) * 100 : 50;
    console.log(`${label}: Long=${l}, Short=${s} → ${longPct.toFixed(1)}% Long / ${(100-longPct).toFixed(1)}% Short ✅`);
  }
}

test().catch(console.error);
