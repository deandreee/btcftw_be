const WebSocketServer = require('ws').Server;
const logger = require.main.require('./core/logger');
const access = require('safe-access');

let wss = null;

let start = (server) => {

  wss = new WebSocketServer({ server });

  logger.info('WebSocketServer server started');

  wss.broadcast = broadcast;

  wss.on('connection', function(ws) {

    try {
      // logger.info({ ip: access(ws, '_socket.remoteAddress') }, 'ws connection');

      ws.on('close', function close() {
        // logger.info({ ip: access(ws, '_socket.remoteAddress') }, 'ws connection close');
      });

      ws.on('error', function (e) {
        logger.error(e, 'ws: error')
      });
    }
    catch(e) {
      logger.error(e, 'ws: catch error')
    }

  });
};

let broadcast = function(data) {
  let json = JSON.stringify(data);

  // logger.info({ clients: wss.clients.length }, 'broadcast clients');

  wss.clients.forEach(function each(client) {
    // because it seems like client is not removed (immediately) from wss.clients list after ws.close();
    if (client.readyState === client.OPEN) {

      // logger.info(data, 'broadcast');

      client.send(json, function ack(err) {

        if (err) {
          logger.error(err, 'ws error');
        }

      });
    }
  });
};

module.exports.start = start;
module.exports.broadcast = broadcast;
