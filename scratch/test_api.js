const handler = require('../api/cot-history.js').default;

const req = { query: { symbol: 'US30' } };
const res = {
  status: (code) => {
    return {
      json: (data) => console.log(JSON.stringify(data, null, 2))
    }
  }
};

handler(req, res);
