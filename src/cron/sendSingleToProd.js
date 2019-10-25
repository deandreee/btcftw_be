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

    let dates = ["2018-03-09T00:00:01.035Z"];

    let ts = dates.map(d => new Date(d).getTime());

    let rows = yield dbProd.soc_stats.find({ ts: { $in: ts } }).toArray();

    for (let row of rows) {
      console.log(row.subName, row.ts, new Date(row.ts));
      yield dbProd.soc_stats_clean.insertOne(row);
    }
  });
};

module.exports.run = run;
