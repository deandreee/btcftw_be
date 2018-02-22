const co = require('co');
const bluebird = require('bluebird');

function* retry({ times, interval }, fn) {
  for (let i=0; i<times; i++) {
    try {
      // console.log('try ' + i);
      return yield fn();
    }
    catch(e) {
      // console.log('after try ' + i);
      if (i === times - 1) {
        throw e;
      }
      else {
        yield waitFor(interval);
      }
    }
  }
}

function waitFor(s) {
  return bluebird.fromCallback(cb => {
    setTimeout(cb, s * 1000);
  });
}

// should not wait/yield for this, meant to be async
function delayAsync(fn, ms) {
  co(function*() {
    yield bluebird.fromCallback(cb => {
      setTimeout(() => {
        fn(); // execute this async without waiting
        cb();
      }, ms);
    });
  });
}

module.exports.waitFor = waitFor;
module.exports.delayAsync = delayAsync;
module.exports.retry = retry;
