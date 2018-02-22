const logger = require('../core/logger');
const config = require.main.require('./config');

module.exports = function (err, req, res, next) {

  if (config.isDev) {
    res.status(500).send({
      result: 'error',
      message: err.message,
      stack: err.stack ? err.stack.split('\n') : null,
      details: err
    });
  }
  else {
    res.status(500).send({
      result: 'error',
      message: 'There seems to be a problem ... '
    });
  }

};
