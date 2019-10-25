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

    let local = yield db.soc_stats_clean
      .find({})
      .sort({ ts: 1 })
      .toArray();

    for (let row of local) {
      yield dbProd.soc_stats_clean.insertOne(row);
    }
  });
};

module.exports.run = run;
