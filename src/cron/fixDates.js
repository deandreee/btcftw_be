const db = require('../core/db');
const logger = require('../core/logger');
const co = require('co');
const axios = require('axios');
const bluebird = require('bluebird');
const ms = require('ms');
const socStats = require('./socStats');
const moment = require('moment');

let run = function*() {
  return yield co(function*() {

    yield db();

    logger.info('after db');

    let { subList } = socStats;

    // not needed for now
    // let rm = yield db.soc_stats.remove({ ts: 1519473600000 })
    // console.log('removed: ', new Date(1519473600000), rm.result);

    let rows = yield db.soc_stats.find({ }).toArray();

    console.log('rows: ', rows.length)

    let dateMap = {
      '2018-02-24T00:00:00.000Z': '2018-02-25T00:00:00.000Z', // stay, sat evening, right where we started
      '2018-02-25T19:46:29.393Z': '2018-02-26T00:00:00.000Z',
      '2018-02-26T22:41:11.197Z': '2018-02-27T00:00:00.000Z',
      '2018-02-27T20:44:32.460Z': '2018-02-28T00:00:00.000Z',
      '2018-02-28T20:27:20.686Z': '2018-03-01T00:00:00.000Z',
      '2018-03-01T20:09:04.849Z': '2018-03-02T00:00:00.000Z',
      '2018-03-02T20:29:15.385Z': '2018-03-03T00:00:00.000Z',
      '2018-03-04T09:05:26.142Z': '2018-03-04T00:00:00.000Z',
      '2018-03-04T18:54:26.251Z': '2018-03-05T00:00:00.000Z',
      '2018-03-05T19:34:32.067Z': '2018-03-06T00:00:00.000Z'
    }

    for (let x of rows) {
      // console.log(new Date(x.ts), moment(x.ts).endOf('day'))
      let oldDate = new Date(x.ts).toISOString();
      let newDate = dateMap[oldDate];
      console.log(oldDate, newDate);

      if (!newDate) {
        // console.error('Date not found for ', oldDate, x.ts);
        // just skip, probaly already mapped
      }
      else {
        let newTs = new Date(newDate).getTime();
        console.log('update: ', newTs, new Date(newTs));
        db.soc_stats.updateOne({ _id: x._id }, { $set: { ts: newTs } });
      }
    }

  })

}

module.exports.run = run;
