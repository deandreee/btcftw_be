const db = require("../core/db");
const logger = require("../core/logger");
const co = require("co");
const axios = require("axios");
const bluebird = require("bluebird");
const ms = require("ms");
const socStats = require("./socStats");

let run = function*() {
  return yield co(function*() {
    yield db();

    logger.info("after db");

    let { subList } = socStats;

    // subList = [{ name: 'bitcoin', sub: 'bitcoin' }];

    for (let x of subList) {
      let rows = yield db.soc_stats_clean
        .find({ subName: x.sub })
        .sort({ ts: 1 })
        .toArray();

      db.soc_stats_clean.updateOne({ _id: rows[0]._id }, { $set: { subscribers_diff: 0 } });

      for (let i = 1; i < rows.length; i++) {
        let subscribers_diff = rows[i].subscribers - rows[i - 1].subscribers;
        console.log(x.sub, rows[i].ts, new Date(rows[i].ts), subscribers_diff);
        db.soc_stats_clean.updateOne({ _id: rows[i]._id }, { $set: { subscribers_diff } });
      }
    }
  });
};

module.exports.run = run;
