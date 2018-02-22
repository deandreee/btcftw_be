const bunyan = require('bunyan');
const errorSerializer = require('./errorSerializer');
const config = require.main.require('./config');

// Or use the bunyan.stdSerializers.err serializer in your Logger and do this log.error({err: err}, "oops"). See "examples/err.js".
let serializers = {
  err: errorSerializer
};

let getPretty = () => {
  const PrettyStream = require('bunyan-prettystream');
  const prettyStdOut = new PrettyStream();
  prettyStdOut.pipe(process.stdout);
  return prettyStdOut;
}

module.exports = bunyan.createLogger({
  name: 'app',
  stream: config.isDev ? getPretty() : process.stdout,
  level: 'info',
  serializers
});
