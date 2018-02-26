const express = require('express');
const co = require('co');
const wrap = require('co-express');
const logger = require.main.require('./core/logger');
const bluebird = require('bluebird');
const config = require.main.require('./config');
const snoowrap = require('snoowrap');
const axios = require('axios');
const apicache = require('apicache');
const cache = apicache.middleware;
const creds = require('./creds');
const db = require.main.require('./core/db');
const statistics = require('blockchain.info/statistics');
const csv = require('csvtojson');

module.exports = () => {

  let api = express.Router();

  // Create a new snoowrap requester with OAuth credentials.
  // For more information on getting credentials, see here: https://github.com/not-an-aardvark/reddit-oauth-helper
  const r = new snoowrap(creds);

  api.get('/sub', wrap(function* (req, res) {

    let subNames = [ 'bitcoin', 'ethereum', 'Ripple',  ];

    let subs = [];

    let ts = Date.now();

    for (let subName of subNames) {
      let sub = (yield axios.get(`https://www.reddit.com/r/${subName}/about.json`)).data;

      // console.log('sub', sub);

      let props = {
        subName,
        ts,
        active_user_count: sub.data.active_user_count,
        accounts_active: sub.data.accounts_active,
        subscribers: sub.data.subscribers
      }

      subs.push(props);
    }

    res.send({ subs });
  }));

  api.get('/posts-count', wrap(function* (req, res) {

    let subName = 'bitcoin';
    let after = Math.floor((Date.now() - ms('24h')) / 1000);
    let type = 'submission'; // comment / submission
    let count = (yield axios.get(`https://api.pushshift.io/reddit/search/${type}/?subreddit=${subName}&metadata=true&size=0&after=${after}`)).data;

    res.send({ count });
  }));

  api.get('/soc-stats', wrap(function* (req, res) {
    let stats = yield db.soc_stats.find({ }).toArray();

    let series = [];
    for (let x of socStats.subList) {
      series.push(stats.filter(y => y.subName === x.sub));
    }

    res.send({ stats, series });
  }));

  api.get('/posts', cache('5 minutes'), wrap(function* (req, res) {
    let { log } = req;
    log.info('get /posts');
    let posts = yield r.getSubreddit('Bitcoin').getTop({ time: 'month', limit: 50 });

    // logger.info({ posts: [ posts[0], posts[1], posts[2], posts[3], posts[4] ]}, 'posts');
    // logger.info({ scores: posts.map(x => x.score) }, 'posts');

    posts = posts.map(x => {
      return { title: x.title, date: x.created_utc * 1000, permalink: x.permalink, score: x.score };
    });

    // logger.info({ a: 'b', c: 'd', posts: [ posts[0], posts[1], posts[3] ] }, 'heyayaya');

    res.send({ posts });

  }));

  api.get('/posts24', cache('5 minutes'), wrap(function* (req, res) {
    let { log } = req;
    log.info('get /posts');
    let posts = yield r.getSubreddit('Bitcoin').getTop({ time: 'day', limit: 50 });

    // logger.info({ posts: [ posts[0], posts[1], posts[2], posts[3], posts[4] ]}, 'posts');
    // logger.info({ scores: posts.map(x => x.score) }, 'posts');

    posts = posts.map(x => {
      return { title: x.title, date: x.created_utc * 1000, permalink: x.permalink, score: x.score };
    });

    // logger.info({ a: 'b', c: 'd', posts: [ posts[0], posts[1], posts[3] ] }, 'heyayaya');

    res.send({ posts });

  }));

  api.get('/posts-eth', cache('5 minutes'), wrap(function* (req, res) {
    let { log } = req;
    log.info('get /posts-eth');
    let posts = yield r.getSubreddit('ethereum').getTop({ time: 'month', limit: 50 });

    posts = posts.map(x => {
      return { title: x.title, date: x.created_utc * 1000, permalink: x.permalink };
    });


    res.send({ posts });

  }));

  api.get('/btc', cache('5 minutes'), wrap(function* (req, res) {
    let { log } = req;
    log.info('get /btc');
    let resp = yield axios.get('https://blockchain.info/charts/market-price?timespan=30days&format=json');
    let btc = resp.data;
    res.send({ btc });
  }));

  api.get('/eth', cache('5 minutes'), wrap(function* (req, res) {
    let { log } = req;
    log.info('get /eth');
    let resp = yield axios.get('https://min-api.cryptocompare.com/data/histohour?fsym=ETH&tsym=USD&limit=30&aggregate=24&e=Kraken&extraParams=btcxreddit');
    let eth = { values: resp.data.Data.map(e => { return { x: e.time, y: e.open }}) };
    res.send({ eth });
  }));

  api.post('/log', wrap(function* (req, res) {
    let { log } = req;
    let { msg } = req.body;
    log.info(msg);
    res.send({ });
  }));

  api.get('/ticker-xbtusd', wrap(function* (req, res) {
    // The $type operator selects documents where the value is a specific BSON type (10 corresponds to Null). $exists will check that the key exists in the subdocument.
    let tickers = yield db.tickers_kraken_xbtusd.find({ ts: {
      $not : { $type : 10 },
      $exists : true }
    }).toArray();
    res.send({ tickers });
  }));

  api.get('/stats', wrap(function* (req, res) {
    // https://github.com/blockchain/api-v1-client-node/tree/master/statistics
    let stats = yield statistics.getChartData('market-price', { timespan: '2days', rollingAverage: '2hours' })
    res.send({ stats });
  }));

  api.get('/csv', wrap(function* (req, res) {
    const fs = require('fs');
    const path = require('path');

    let csvPath = path.join(__dirname, './coindesk-bpi-USD-close_data-2018-02-08_2018-02-09.csv');
    const file = yield bluebird.fromCallback(cb => fs.readFile(csvPath, 'utf8', cb));
    // const file = require()

    let rows = [];
    csv()
      .fromString(file)
      // .fromFile('./coindesk-bpi-USD-close_data-2018-02-08_2018-02-09.csv')
      .on('json',(jsonObj) => {
        // combine csv header row and csv line to a json
        // jsonObj.a ==> 1 or 4

        if (jsonObj['Close Price']) { // skip 2 last empty rows
          let date = new Date(jsonObj['Date']);

          // tz is atcually 0 but not set in data, need to manually adjust
          date.setHours(date.getHours() + 2);

          rows.push({ x: date.getTime(), y: parseFloat(jsonObj['Close Price']) });
          // rows.push({ x: date.toISOString(), y: jsonObj['Close Price'] });
        }

      })
      .on('done',(error) => {
        if (error) {
          res.send({ error, msg: error.message });
        }
        else {
          res.send({ btc: { values: rows }});
        }
      })

  }));

  api.get('/btc24h', cache('5 minutes'), wrap(function* (req, res) {
    let { log } = req;

    log.info('get /btc24h');

    let limit = 1440; // 24h
    let from = 'BTC'; // 24h
    let to = 'USD'; // 24h
    let aggregate = 5; // 1min

    let resp = yield axios.get(`https://min-api.cryptocompare.com/data/histominute?fsym=${from}&tsym=${to}&limit=${limit}&aggregate=${aggregate}&e=CCCAGG`);
    let btc = resp.data;
    res.send({ btc });
  }));

  api.get('/comments', wrap(function* (req, res) {

    let nowMinus10Min = (Date.now() - 1000 * 60 * 5) / 1000; // because unix ts

    let comments = yield db.comments.find(
      { created_utc: { $gt: nowMinus10Min }}
    ).sort({ created_utc: -1 }).toArray();

    res.send({ comments });
  }));

  api.get('/dbg', wrap(function* (req, res) {
    let { NOW, NOW_URL } = process.env;
    res.send({ NOW, NOW_URL });
  }));


  return api;

};
