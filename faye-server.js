var http = require('http');
var faye = require('faye');


function FayeServer(options) {
  console.log(options);
  this.options = {
    port: options.FAYE_PORT || 8080,
    mount: options.FAYE_MOUNT || '/bayeux',
    timeout: options.FAYE_TIMEOUT || 45,
    logging: options.FAYE_LOGGING || 'false',
    stats: options.FAYE_STATS || 'false',
    statsPort: options.FAYE_STATS_PORT || 1936
  };
  this.httpServer = null;
  this.statsServer = null;
}


FayeServer.prototype.start = function() {
  if (this.httpServer) {
    throw new Error('Server is already running on port ' + this.options.port);
  }

  if (this.options.logging === 'true') {
    console.log('Starting Faye server\n' + JSON.stringify(this.options, null, 2));
  }

  // Configure adapter
  var bayeux = new faye.NodeAdapter({
    mount: this.options.mount,
    timeout: this.options.timeout
  });

  // Log client connections + subscriptions
  if (this.options.logging === 'true') {
    bayeux.on('handshake', function(clientId) {
      console.log('[' + new Date() + '] Client ' + clientId + ' connected');
    });

    bayeux.on('disconnect', function(clientId) {
      console.log('[' + new Date() + '] Client ' + clientId + ' disconnected');
    });

    bayeux.on('subscribe', function(clientId, channel) {
      console.log('[' + new Date() + '] Client ' + clientId + ' subscribed to ' + channel);
    });

    bayeux.on('unsubscribe', function(clientId, channel) {
      console.log('[' + new Date() + '] Client ' + clientId + ' unsubscribed from ' + channel);
    });
  }


  // Collect statistics
  var statistics = {
    connections: 0,
    subscriptions: 0,
    messages: 0
  }

  if (this.options.stats === 'true') {
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


  // Set up server
  this.httpServer = http.createServer();
  bayeux.attach(this.httpServer);
  this.httpServer.listen(this.options.port);

  if (this.options.stats === 'true') {
    this.statsServer = http.createServer(function(request, response) {
      response.writeHead(200, {
        'Content-Type': 'application/json'
      });
      response.end(JSON.stringify(statistics, null, 2));
    });
    this.statsServer.listen(this.options.statsPort);
  }
};


FayeServer.prototype.stop = function() {
  if (this.options.logging === 'true') {
    console.log('Stopping server at port ' + this.options.port);
  }

  if (this.httpServer) {
    this.httpServer.close(function() {
      if (this.options.logging === 'true') {
        console.log('Faye service stopped');
      }
    });
    this.httpServer = null;
  }

  if (this.statsServer) {
    this.statsServer.close(function() {
      if (this.options.logging === 'true') {
        console.log('Stats service stopped');
      }
    });
    this.statsServer = null;
  }
};

module.exports = FayeServer;
