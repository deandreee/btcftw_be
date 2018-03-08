const axios = require('axios');
const logger = require.main.require('./core/logger');
const db = require.main.require('./core/db');
const ws = require('./index');

let getTicker = async() => {
  return (await axios.get('https://api.kraken.com/0/public/Ticker?pair=XBTUSD')).data;
}

let getBtcPriceNow = async() => {
  return (await axios.get('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD')).data;
}

let start = () => {

  logger.info('looping kraken prices ...');

  // setInterval(async () => {
  //
  //   let ticker = (await getTicker()).result.XXBTZUSD;
  //   ticker.ts = Date.now();
  //   logger.info({ c0: ticker.c[0] }, 'XBTUSD kraken');
  //   db.tickers_kraken_xbtusd.insertOne(ticker);
  //
  //   ws.broadcast({ type: 'ticket', ticker });
  //
  // }, 5000);

  setInterval(async () => {
    let btc = await getBtcPriceNow();
    // logger.info({ usd: btc.USD }, 'BTCxUSD cryptocompare');
    ws.broadcast({ type: 'btc-price-now', btc });
  }, 5000);

};

module.exports.start = start;
