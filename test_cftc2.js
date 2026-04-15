const axios = require('axios');

async function test() {
  console.log("Fetching datasets...");
  try {
    const [cftcRes1, cftcRes2] = await Promise.allSettled([
      axios.get('https://publicreporting.cftc.gov/resource/6dca-aqww.json?$limit=800&$order=report_date_as_yyyy_mm_dd DESC', { timeout: 15000 }),
      axios.get('https://publicreporting.cftc.gov/resource/dea3-kfc2.json?$limit=800&$order=report_date_as_yyyy_mm_dd DESC', { timeout: 15000 })
    ]);

    const cftcData = [];
    if (cftcRes1.status === 'fulfilled') cftcData.push(...cftcRes1.value.data);
    if (cftcRes2.status === 'fulfilled') cftcData.push(...cftcRes2.value.data);

    console.log("Total rows fetched:", cftcData.length);
    
    const cftcMap = {
      'EURO FX': 'EURUSD',
      'BRITISH POUND': 'GBPUSD',
      'CANADIAN DOLLAR': 'USDCAD',
      'AUSTRALIAN DOLLAR': 'AUDUSD'
    };
    
    const found = {};
    cftcData.forEach(row => {
      for (const [cftcName, assetId] of Object.entries(cftcMap)) {
        if (row.market_and_exchange_names && row.market_and_exchange_names.includes(cftcName)) {
           if (!found[assetId]) {
             found[assetId] = {
               name: row.market_and_exchange_names,
               long: parseFloat(row.noncomm_positions_long_all) || 0,
               short: parseFloat(row.noncomm_positions_short_all) || 0
             }
           }
        }
      }
    });

    console.log("Results:");
    console.log(found);
    
  } catch (e) {
    console.error(e);
  }
}
test();
