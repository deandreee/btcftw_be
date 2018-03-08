const db = require('../core/db');
const logger = require('../core/logger');
const co = require('co');
const axios = require('axios');
const bluebird = require('bluebird');
const ms = require('ms');

let subList = [

  { name: 'bitcoin', sub: 'bitcoin' },
  { name: 'ethereum', sub: 'ethereum' },
  { name: 'ripple', sub: 'ripple' },
  { name: 'bitcoincash', sub: 'bitcoincash' },
  { name: 'litecoin', sub: 'litecoin' },
  { name: 'cardano', sub: 'cardano' },
  { name: 'neo', sub: 'neo' },
  { name: 'stellar', sub: 'stellar' },
  { name: 'eos', sub: 'eos' },
  { name: 'iota', sub: 'iota' },


  { name: 'dash', sub: 'dashpay' },
  { name: 'monero', sub: 'monero' },
  { name: 'EthereumClassic', sub: 'EthereumClassic' },
  { name: 'nem', sub: 'nem' },
  { name: 'Vechain', sub: 'Vechain' },
  { name: 'TRON', sub: 'Tronix' },
  { name: 'Tether', sub: 'Tether' },
  { name: 'Lisk', sub: 'Lisk' },
  { name: 'Qtum', sub: 'Qtum' },


  { name: 'nano', sub: 'nanocurrency' },
  { name: 'OmiseGO', sub: 'omise_go' },
  { name: 'ICON', sub: 'helloicon' },
  { name: 'Zcash', sub: 'zec' },
  { name: 'Binance Coin', sub: 'BinanceExchange' },
  { name: 'Steem', sub: 'steem' },
  { name: 'verge', sub: 'vergecurrency' },
  { name: 'Bytecoin', sub: 'BytecoinBCN' },
  { name: 'Populous', sub: 'populous_platform' },
  { name: 'DigixDAO', sub: 'digix' }


];

let calcSubscribersDiff = function*(props) {

  // logger.info('calcSubscribersDiff start');
  let prevArr = yield db.soc_stats.find({ subName: props.subName }).sort({ ts: -1 }).limit(1).toArray();

  if (prevArr && prevArr[0]) {
    let prev = prevArr[0];

    let subscribers_diff = props.subscribers - prev.subscribers;

    console.log(props.subName, props.ts, new Date(props.ts), subscribers_diff);

    // logger.info('calcSubscribersDiff end');

    return subscribers_diff;
  }
}

let run = function*() {
  return yield co(function*() {

    yield db();

    // logger.info({ comments: db.comments }, 'comments');

    let ts = Date.now();
    // let ts = new Date('2018-02-24T12:00:00.000Z');

    logger.info('after db');

    for (let x of subList) {
      let sub = (yield axios.get(`https://www.reddit.com/r/${x.sub}/about.json`)).data;

      let props = {
        subName: x.sub,
        ts,
        active_user_count: sub.data.active_user_count,
        accounts_active: sub.data.accounts_active,
        subscribers: sub.data.subscribers,
        posts_count: yield getCount(x.sub, 'submission'),
        comments_count: yield getCount(x.sub, 'comment')
      }

      // logger.info('subscribers_diff start');
      props.subscribers_diff = yield calcSubscribersDiff(props);

      logger.info(props, x.sub);

      yield db.soc_stats.insertOne(props);

      yield wait(3);
    }
  })

}

// let type = 'submission'; // comment / submission
let getCount = function*(subName, type) {

  let after = Math.floor((Date.now() - ms('24h')) / 1000);
  let data = (yield axios.get(`https://api.pushshift.io/reddit/search/${type}/?subreddit=${subName}&metadata=true&size=0&after=${after}`)).data;

  return data.metadata.total_results;
}

let wait = function*(s) {
  return yield new bluebird((resolve) => {
    setTimeout(() => resolve(), s * 1000);
  })
}

module.exports.run = run;
module.exports.subList = subList;
