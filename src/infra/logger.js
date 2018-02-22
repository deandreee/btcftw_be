const PrettyStream = require('bunyan-prettystream');
const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

const bunyan = require('bunyan');
const errorSerializer = require('./errorSerializer');
const config = require.main.require('./config');

// Or use the bunyan.stdSerializers.err serializer in your Logger and do this log.error({err: err}, "oops"). See "examples/err.js".
let serializers = {
  err: errorSerializer
};

module.exports = bunyan.createLogger({
  name: "app",
  streams: [{
    level: 'info',
    type: 'raw',
    stream: config.isDev ? prettyStdOut : process.stdout,
    serializers
  }]
});
