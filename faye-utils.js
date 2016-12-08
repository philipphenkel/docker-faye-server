let enableLoggingOfConnections = function(bayeux) {

  bayeux.on('handshake', function(clientId) {
    console.log('[' + new Date() + '] Client ' + clientId + ' connected');
  });

  bayeux.on('disconnect', function(clientId) {
    console.log('[' + new Date() + '] Client ' + clientId + ' disconnected');
  });
}

let enableLoggingOfSubscriptions = function(bayeux) {

  bayeux.on('subscribe', function(clientId, channel) {
    console.log('[' + new Date() + '] Client ' + clientId + ' subscribed to ' + channel);
  });

  bayeux.on('unsubscribe', function(clientId, channel) {
    console.log('[' + new Date() + '] Client ' + clientId + ' unsubscribed from ' + channel);
  });
}

let enableStatistics = function(bayeux, statistics) {

  statistics.connections = 0;
  statistics.subscriptions = 0;
  statistics.messages = 0;

  bayeux.on('handshake', function(clientId) {
    statistics.connections++;
  });

  bayeux.on('disconnect', function(clientId) {
    statistics.connections--;
  });

  bayeux.on('subscribe', function(clientId, channel) {
    statistics.subscriptions++;
  });

  bayeux.on('unsubscribe', function(clientId, channel) {
    statistics.subscriptions--;
  });

  bayeux.on('publish', function(clientId, channel, data) {
    statistics.messages++;
  });
}

let statisticsRequestListener = function(statistics) {
  return (request, response) => {
    response.writeHead(200, {
      'Content-Type': 'application/json'
    });
    response.end(JSON.stringify(statistics, null, 2));
  };
}

module.exports = {
  enableLoggingOfConnections,
  enableLoggingOfSubscriptions,
  enableStatistics,
  statisticsRequestListener
};
