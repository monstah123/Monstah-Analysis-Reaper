const axios = require('axios');
async function run() {
  try {
    const res = await axios.get('https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1d');
    console.log(res.data[res.data.length - 1]);
  } catch (e) {
    console.error(e.message);
  }
}
run();
