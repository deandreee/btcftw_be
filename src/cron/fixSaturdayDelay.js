const db = require('../core/db');
const logger = require('../core/logger');
const co = require('co');
const axios = require('axios');
const bluebird = require('bluebird');
const ms = require('ms');
const socStats = require('./socStats');

let run = function*() {
  return yield co(function*() {

    yield db();

    logger.info('after db');

    let { subList } = socStats;

    let rows = yield db.soc_stats.find({ ts: 1520154326142 }).toArray();

    console.log('rows: ', rows.length)

    for (let x of rows) {

      let oldDiff = x.subscribers_diff;
      let newDiff = Math.floor(x.subscribers_diff * 2/3);

      // need to calc this because calcSubscriberDiff will override anyways
      let oldSubs = x.subscribers;
      let newSubs = x.subscribers - Math.floor(oldDiff * 1/3);


      console.log('update:', x.subName, oldSubs, newSubs);

      // console.log('update:', x.subName, oldDiff, newDiff);
      db.soc_stats.updateOne({ _id: x._id }, { $set: { subscribers: newSubs } });

    }

  })

}

module.exports.run = run;
