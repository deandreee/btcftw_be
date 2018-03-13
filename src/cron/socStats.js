const db = require('../core/db');
const logger = require('../core/logger');
const co = require('co');
const axios = require('axios');
const bluebird = require('bluebird');
const ms = require('ms');

let subList = [

  { name: 'bitcoin', sub: 'bitcoin', color: '#F7931A' },
  { name: 'ethereum', sub: 'ethereum', color: '#282828' },
  { name: 'ripple', sub: 'ripple', color: '#346AA9' },
  { name: 'bitcoincash', sub: 'bitcoincash', color: '#4cca47' },
  { name: 'litecoin', sub: 'litecoin', color: '#838383' },
  { name: 'cardano', sub: 'cardano', color: '#3CC8C8' },
  { name: 'neo', sub: 'neo', color: '#58BF00' },
  { name: 'stellar', sub: 'stellar', color: '#08B5E5' },
  { name: 'eos', sub: 'eos', color: '#19191A' },
  { name: 'iota', sub: 'iota', color: '#FFFFFF' },


  { name: 'dash', sub: 'dashpay', color: '#1c75bc' },
  { name: 'monero', sub: 'monero', color: '#FF6600' },
  { name: 'EthereumClassic', sub: 'EthereumClassic', color: '#669073' },
  { name: 'nem', sub: 'nem', color: '#41bf76' },
  { name: 'Vechain', sub: 'Vechain', color: '#0375a9' },
  { name: 'TRON', sub: 'Tronix', color: '#396a74' },
  { name: 'Tether', sub: 'Tether', color: '#22a079' },
  { name: 'Lisk', sub: 'Lisk', color: '#1A6896' },
  { name: 'Qtum', sub: 'Qtum', color: '#359BCE' },
  // this actually has 9 ... :/
  { name: 'nano', sub: 'nanocurrency', color: '#24a0ed' }, // let's move anno up

  // looks like bitcoin gold was the one we skipped ...

  { name: 'OmiseGO', sub: 'omise_go', color: '#1A53F0' },
  { name: 'ICON', sub: 'helloicon', color: '#4c6f8c' },
  { name: 'Zcash', sub: 'zec', color: '#e5a93d' },
  { name: 'Binance Coin', sub: 'BinanceExchange', color: '#edba2d' },
  { name: 'Steem', sub: 'steem', color: '#1A5099' },
  { name: 'verge', sub: 'vergecurrency', color: '#42AFB2' },
  { name: 'Bytecoin', sub: 'BytecoinBCN', color: '#964F51' },
  { name: 'Populous', sub: 'populous_platform', color: '#337ab7' },
  { name: 'DigixDAO', sub: 'digix', color: '#FF3B3B' },

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
