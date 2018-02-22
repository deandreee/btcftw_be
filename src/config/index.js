const ip = require.main.require('./utils/ip');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
let isDev = process.env.NODE_ENV === 'development';

let config = {};

config.name = 'btcxreddit';
config.version = '0.0.3';
config.port = 3001;
config.isDev = isDev;

config.mongoURI = process.env.MONGO_URI
  ? `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_URI}`
  : `mongodb://localhost:27017/crp`;

config.sessionSecret = 'dontreallycarefornow';

module.exports = config;
