import handler from '../api/sentiment.js';

const res = {
  setHeader: () => {},
  status: (code) => ({
    json: (data) => console.log(JSON.stringify(data, null, 2))
  })
};

const req = {};

handler(req, res).catch(console.error);
