const logger = require.main.require('./core/logger');
const config = require.main.require('./config');

module.exports = () => function(req, res, next) {

  let props = {
    _v: config.version,
    ip: req.ip
  };

  if (!config.isDev) {
    userAgent: req.get('User-Agent')
  }

  req.log = logger.child(props);

  next();
};
