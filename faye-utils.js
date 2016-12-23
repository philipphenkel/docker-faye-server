const enableLoggingOfConnections = (bayeux) => {

  bayeux.on('handshake', (clientId) => {
    console.log('[' + new Date() + '] Client ' + clientId + ' connected');
  });

  bayeux.on('disconnect', (clientId) => {
    console.log('[' + new Date() + '] Client ' + clientId + ' disconnected');
  });
}

const enableLoggingOfSubscriptions = (bayeux) => {

  bayeux.on('subscribe', (clientId, channel) => {
    console.log('[' + new Date() + '] Client ' + clientId + ' subscribed to ' + channel);
  });

  bayeux.on('unsubscribe', (clientId, channel) => {
    console.log('[' + new Date() + '] Client ' + clientId + ' unsubscribed from ' + channel);
  });
}

const enableStatistics = (bayeux, statistics) => {

  statistics.connections = 0;
  statistics.subscriptions = 0;
  statistics.messages = 0;

  bayeux.on('handshake', (clientId) => statistics.connections++);
  bayeux.on('disconnect', (clientId) => statistics.connections--);
  bayeux.on('subscribe', (clientId, channel) => statistics.subscriptions++);
  bayeux.on('unsubscribe', (clientId, channel) => statistics.subscriptions--);
  bayeux.on('publish', (clientId, channel, data) => statistics.messages++);
}

const statisticsRequestListener = (statistics) => {
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
