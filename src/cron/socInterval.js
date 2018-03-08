const CronJob = require('cron').CronJob;
const logger = require.main.require('./core/logger');
const socStats = require('./socStats');
const co = require('co');

let run = function() {

  let timeZone = 'Europe/London'; // let's go with 0

  logger.info('cron waiting ... ');

  // 0 will be every min
  // 0 0 every hour
  // new CronJob('0 0 * * * *', function() {
  new CronJob('00 00 * * * *', function() {

    logger.info('cron starting ... ');

    co(function*() {
      logger.info('cron running ... ');
      yield socStats.run();
    });

  }, null, true, timeZone);

}

module.exports.run = run;
