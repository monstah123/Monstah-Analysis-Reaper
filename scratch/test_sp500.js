import axios from 'axios';

async function test() {
  const response = await axios.get('https://www.cftc.gov/dea/newcot/FinFut.txt', {
     timeout: 5000,
     headers: { 'User-Agent': 'Monstah-Analysis-Reaper/1.0' }
  });
  const txt = response.data;
  const mappings = [
    { id: 'SP500', names: ['E-MINI S&P 500', 'S&P 500 CONSOLIDATED', 'S&P 500 STOCK INDEX'] },
    { id: 'NASDAQ', names: ['NASDAQ-100 CONSOLIDATED', 'NASDAQ MINI', 'NASDAQ 100'] },
    { id: 'US30', names: ['DOW JONES INDUSTRIAL AVERAGE CONSOLIDATED', 'DOW JONES INDUSTRIAL', 'DJIA CONSOLIDATED'] }
  ];
  const results = {};
  mappings.forEach(m => {
     for (const name of m.names) {
       const uName = name.toUpperCase();
       const assetIndex = txt.toUpperCase().indexOf(uName);
       if (assetIndex !== -1) {
          const block = txt.substring(assetIndex, assetIndex + 2000);
          const lines = block.split('\n');
          const posRow = lines.find(l => l.trim().toUpperCase().startsWith('POSITIONS'));
          if (posRow) {
             const cols = posRow.trim().split(/\s+/);
             if (cols.length >= 6) {
                results[m.id] = {
                   long: parseInt(cols[4].replace(/,/g, '')),
                   short: parseInt(cols[5].replace(/,/g, '')),
                   source: 'CFTC TFF Report',
                   matchedName: name
                };
                break;
             }
          }
       }
     }
  });
  console.log(JSON.stringify(results, null, 2));
}
test();
