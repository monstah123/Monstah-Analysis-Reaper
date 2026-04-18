const axios = require('axios');

async function test() {
  const symbol = 'NASDAQ';
  const cftcNames = ['NASDAQ-100 Consolidated', 'NASDAQ 100 STOCK INDEX', 'E-MINI NASDAQ 100'];
  const namesQuery = cftcNames.map(n => `market_and_exchange_names='${n}'`).join(' OR ');
  
  const url1 = `https://publicreporting.cftc.gov/resource/dea3-kfc2.json?$where=(${namesQuery})&$limit=5&$order=report_date_as_yyyy_mm_dd DESC`;
  const url2 = `https://publicreporting.cftc.gov/resource/6dca-aqww.json?$where=(${namesQuery})&$limit=5&$order=report_date_as_yyyy_mm_dd DESC`;

  console.log('Testing URL 1:', url1);
  try {
    const res1 = await axios.get(url1);
    console.log('URL 1 Response Count:', res1.data.length);
    if (res1.data.length > 0) console.log('Sample Row 1:', res1.data[0]);
  } catch (e) {
    console.error('URL 1 Error:', e.message);
  }

  console.log('\nTesting URL 2:', url2);
  try {
    const res2 = await axios.get(url2);
    console.log('URL 2 Response Count:', res2.data.length);
    if (res2.data.length > 0) console.log('Sample Row 2:', res2.data[0]);
  } catch (e) {
    console.error('URL 2 Error:', e.message);
  }
}

test();
