const db = require("../core/db");
const dbConn = require("../core/dbConn");
const logger = require("../core/logger");
const co = require("co");
const axios = require("axios");
const bluebird = require("bluebird");
const ms = require("ms");
const socStats = require("./socStats");
const moment = require("moment");

const PROD_CONN_STR = ""; // TODO:

let run = function*() {
  return yield co(function*() {
    yield db();
    let dbProd = yield dbConn(PROD_CONN_STR);

    logger.info("after db");

    let { subList } = socStats;

    let local = yield pickLocal(db);
    let prod = yield pickProd(dbProd);

    for (let x of [...local, ...prod]) {
      console.log(x.subName, x.ts, new Date(x.ts), x.subscribers);
    }

    for (let row of [...local, ...prod]) {
      yield dbProd.soc_stats_clean.insertOne(row); // SWITCH HERE: !!! db vs dbProd
    }
  });
};

let pickLocal = function*(db) {
  let dates = [
    // '2018-02-25T00:00:00.000Z',
    // '2018-02-26T00:00:00.000Z',
    // '2018-02-27T00:00:00.000Z',
    // '2018-02-28T00:00:00.000Z',
    // '2018-03-01T00:00:00.000Z',
    // '2018-03-02T00:00:00.000Z',
    // '2018-03-03T00:00:00.000Z',
    // '2018-03-04T00:00:00.000Z',
    // '2018-03-05T00:00:00.000Z',
    // '2018-03-06T00:00:00.000Z'
  ];

  let ts = dates.map(d => new Date(d).getTime());

  return yield db.soc_stats
    .find({ ts: { $in: ts } })
    .sort({ ts: 1 })
    .toArray();
};

let pickProd = function*(dbProd) {
  let dates = [
    // '2018-03-07T00:00:00.885Z',
    // '2018-03-08T00:00:00.937Z',

    // '2018-03-10T00:00:00.542Z'

    // '2018-03-11T00:00:00.354Z',
    // '2018-03-12T00:00:00.364Z'

    // '2018-03-13T00:00:01.110Z'

    "2018-03-14T00:00:00.000Z"
  ];

  let ts = dates.map(d => new Date(d).getTime());

  return yield dbProd.soc_stats
    .find({ ts: { $in: ts } })
    .sort({ ts: 1 })
    .toArray();
};

module.exports.run = run;
