'use strict';

let mongodb = require('mongodb');
let config = require.main.require('./config');
let utilsTimeout = require.main.require('./utils/utilsTimeout');
let collections = require('./collections');
let logger = require('./logger');

module.exports = function* (mongoURI) {

  let db = yield utilsTimeout.retry({ times: 5, interval: 3 }, () => {
    return mongodb.MongoClient.connect(mongoURI);
  });

  db.on('error', (e) => { logger.error(e); });

  let res = {};

  Object.assign(res, { databaseName: db.databaseName });

  collections.forEach(c => {
    Object.assign(res, { [c]: db.collection(c) });
  });

  return res;
};
