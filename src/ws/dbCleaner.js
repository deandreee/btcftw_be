const logger = require.main.require('./core/logger');
const db = require.main.require('./core/db');

let interval = 5 * 60 * 1000; // 5 min
let cleanInterval = interval * 2; // because utc unix

let remove = async() => {
  logger.info({ ts: new Date(Date.now() - cleanInterval) }, 'dbCleaner: remove start');
  let removed = await db.comments.remove({ saved_db_ts: { $lt: Date.now() - cleanInterval } });
  logger.info({ removed }, 'dbCleaner: remove success');
  return removed;
}

let start = () => {

  logger.info('dbCleaner: started');

  // remove comments older than
  setInterval(async () => {
    try {
      await remove();
    }
    catch(e) {
      logger.error(e);
    }
  }, interval);

};

module.exports.start = start;
module.exports.remove = remove; // expose for tests
