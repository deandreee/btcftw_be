const co = require('co');
const logger = require('./core/logger');

let execute = function() {

  let scriptName = process.env.CRON;
  if (!scriptName) {
    logger.info('process.env.CRON is not set!');
    return;
  }

  logger.info('executing script ' + scriptName);
  const migrationScript = require('./cron/' + scriptName);

  return co(function*() {
    yield migrationScript.run();
    logger.info('COMPLETED SUCCESSFULLY');
  }).catch(err => {
    logger.error(err);
  });
};

execute();
