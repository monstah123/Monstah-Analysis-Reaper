const axios = require('axios');

async function check() {
  const datasets = [
    { id: 'dea3-kfc2', name: 'Legacy Futures' },
    { id: '6dca-aqww', name: 'Disaggregated Futures' },
    { id: '72hh-3qpy', name: 'Financial Futures' }
  ];

  for (const ds of datasets) {
    try {
      const res = await axios.get(`https://publicreporting.cftc.gov/resource/${ds.id}.json?$limit=500&$order=report_date_as_yyyy_mm_dd DESC`);
      const data = res.data;
      const found = data.filter(r => r.market_and_exchange_names && r.market_and_exchange_names.includes('CANADIAN DOLLAR'));
      console.log(`Dataset ${ds.name} (${ds.id}) has ${found.length} entries for CANADIAN DOLLAR`);
      if (found.length > 0) {
        console.log("Keys available:", Object.keys(found[0]).join(', '));
        console.log("Sample long:", found[0].noncomm_positions_long_all, "Sample short:", found[0].noncomm_positions_short_all);
      }
    } catch (e) {
      console.log(`Failed on ${ds.id}:`, e.message);
    }
  }
}
check();
