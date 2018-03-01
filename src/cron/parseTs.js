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

    let rows = yield db.soc_stats.find({ }).toArray();

    for (let x of rows) {
      if (!Number.isInteger(x.ts)) {
        console.log('update:', x.ts, new Date(x.ts).getTime());
        db.soc_stats.updateOne({ _id: x._id }, { $set: { ts: new Date(x.ts).getTime() } });
      }
    }

  })

}

module.exports.run = run;
