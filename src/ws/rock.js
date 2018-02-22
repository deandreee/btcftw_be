const Rockets = require('rockets');
const logger = require.main.require('./core/logger');

let client = new Rockets();

// Register events on the client.
client.on('connect', function() {

  logger.info('liveReddit connect success');

  var include = {

    // Only receive comments in r/programming.
    subreddit: 'bitcoin',

    // Only receive comments that contain the pattern 'rockets'.
    // contains: [
    //   'rockets',
    // ]
  };

  var exclude = {

    // Skip comments that contain the word "hack".
    // contains: [
    //   'hack',
    // ]
  };

  // Subscribe to the 'comments' channel.
  client.subscribe('comments', include, exclude);
});

client.on('comment', function(comment) {
  // Do something using the comment data.
  logger.info({ comment }, 'comment');
});

// Initiate the client's socket connection.

module.exports.connect = () => {
  logger.info('liveReddit connect start');
  client.connect();
}
