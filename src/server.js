const express = require('express');
const app = express();
const co = require('co');
const http = require('http');
const logger = require('./core/logger');
const bodyParser = require('body-parser');
const db = require('./core/db');
const config = require('./config');
const cookieParser = require('cookie-parser');
const error = require('./middleware/error');
const cache = require('./middleware/cache');
const log = require('./middleware/log');
const routes = require('./routes');
const path = require('path');
const snoo = require('./ws/snoo');
const wsServer = require('./ws');
const priceLooper = require('./ws/priceLooper');
const dbCleaner = require('./ws/dbCleaner');
const socInterval = require('./cron/socInterval');

co(function* () {

  yield db();

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(cache());
  app.use(log());

  app.set('x-powered-by', false);
  app.set('trust proxy', true);

  if (!config.isDev) {
    logger.info('starting ui serve');
    app.use(express.static(path.join(__dirname, '../ui')));

    app.get(/^(?!.*\/api).*$/, (req, res) => {
      res.sendFile(path.join(__dirname, '../ui/index.html'));
    });
  }

  routes.init(app);
  app.use(error);

  let server = http.createServer(app).listen(config.port);

  logger.info({
    port: config.port,
    env: process.env.NODE_ENV
  }, 'server started');

  // snoo.start();
  wsServer.start(server);
  // priceLooper.start();

  // socInterval.run(); // COMPLETELY MOVED TO CRONBASE

  yield dbCleaner.remove(); // test
  dbCleaner.start();

  process.on('uncaughtException', function (err) {
    logger.fatal(err);
  });

}).catch(e => {
  logger.error(e);
});
