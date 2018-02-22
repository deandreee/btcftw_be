const snoostorm = require("snoostorm");
const snoowrap = require('snoowrap');
const ws = require('./index');
const logger = require.main.require('./core/logger');
const db = require.main.require('./core/db');
let creds  = require.main.require("./routes/r/creds");

let start = () => {
  let client = new snoostorm(new snoowrap(creds));

  db.comments.insertOne({ b: 'wasd' });

  let commentStream = client.CommentStream({
    "subreddit": "bitcoin", // optional, defaults to "all",
    "results": 5,              // The number of results to request per request, more the larger the subreddit, about how many results you should get in 2 seconds. Defaults to 5
    "pollTime": 2000           // Time in between polls in milliseconds, defaults to 2000, 30 times a minute, in accordance with Reddit's 60req/min, allowing you to perform both comment and submission updates. Note that snoowrap will automatically wait to be in compliance with Reddit's Guidelines
  });

  // setInterval(function() {
  //   ws.broadcast({ type: 'comment', comment: { body: 'hello', permalink: Date.now() + '', author: 'whatever' } });
  // }, 1000);

  commentStream.on("comment", async function(comment) {

    let commentJson = JSON.parse(JSON.stringify(comment));
    let existing = await db.comments.findOne({ permalink: commentJson.permalink });

    if (!existing) {
      logger.info({ body: comment.body }, `New comment by ${comment.author.name}`);
      commentJson.saved_db_ts = Date.now();
      ws.broadcast({ type: 'comment', comment });
      db.comments.insertOne(commentJson); // materialize
    }
    else {
      logger.info({ body: comment.body }, `Skipping comment (duplicate) by ${comment.author.name}`);
    }

    //
    //
    // try {
    // }
    // catch(e) {
    //   logger.error(e.message);
    // }

  });

  var submissionStream = client.SubmissionStream({
    "subreddit": "bitcoin", // optional, defaults to "all",
    "results": 5              // The number of results to request per request, more the larger the subreddit, about how many results you should get in 2 seconds. Defaults to 5
  })

  submissionStream.on("submission", function(post) {
    logger.info(`New submission by ${post.author.name}`);
  });

  setTimeout(function() {
    submissionStream.emit("stop"); // Stop recieving new events
  }, 1000);
}

module.exports.start = start;
