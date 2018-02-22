'use strict';

let mongodb = require('mongodb');
let config = require.main.require('./config');
let utilsTimeout = require.main.require('./utils/utilsTimeout');
let collections = require('./collections');
let logger = require('./logger');

module.exports = function* () {

  let db = yield utilsTimeout.retry({ times: 5, interval: 3 }, () => {
    return mongodb.MongoClient.connect(config.mongoURI);
  });

  db.on('error', (e) => { logger.error(e); });

  Object.assign(module.exports, { databaseName: db.databaseName });

  collections.forEach(c => {
    Object.assign(module.exports, { [c]: db.collection(c) });
  });
};
