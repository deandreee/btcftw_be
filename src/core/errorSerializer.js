// taken from bunyan stdSerializers but witl additional info field
function getFullErrorStack(ex) {
  let ret = ex.stack || ex.toString();
  if (ex.cause && typeof (ex.cause) === 'function') {
    let cex = ex.cause();
    if (cex) {
      ret += '\nCaused by: ' + getFullErrorStack(cex);
    }
  }
  return (ret);
}

// Serialize an Error object
// (Core error properties are enumerable in node 0.4, not in 0.6).
module.exports = function err(err) {
  if (!err || !err.stack) {
    return err;
  }

  let obj = {
    message: err.message,
    name: err.name,
    info: err.info,
    stack: getFullErrorStack(err),
    code: err.code,
    signal: err.signal
  };

  return obj;
};
