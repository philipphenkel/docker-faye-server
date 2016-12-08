let http = require('http');
let faye = require('faye');
let extensions = require('./faye-extensions');


class FayeServer {
  constructor(options = {}) {
    this.options = {
      port: options.port || options.FAYE_PORT || 8080,
      mount: options.mount || options.FAYE_MOUNT || '/bayeux',
      timeout: options.timeout || options.FAYE_TIMEOUT || 45,
      logging: options.logging || options.FAYE_LOGGING || 'false',
      stats: options.stats || options.FAYE_STATS || 'false',
      statsPort: options.statsPort || options.FAYE_STATS_PORT || 1936,
      wildcardSubscriptionOnRoot: options.wildcardSubscriptionOnRoot || options.FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT || 'false'
    };
    this.httpServer = null;
    this.statsServer = null;
  }


  start() {
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

    if (!(this.options.wildcardSubscriptionOnRoot === 'true')) {
      bayeux.addExtension(extensions.forbidWildcardSubscriptionOnRoot);
    }


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
      this.statsServer = http.createServer((request, response) => {
        response.writeHead(200, {
          'Content-Type': 'application/json'
        });
        response.end(JSON.stringify(statistics, null, 2));
      });
      this.statsServer.listen(this.options.statsPort);
    }
  };


  stop() {
    if (this.options.logging === 'true') {
      console.log('Stopping server at port ' + this.options.port);
    }

    if (this.httpServer) {
      this.httpServer.close(() => {
        if (this.options.logging === 'true') {
          console.log('Faye service stopped');
        }
      });
      this.httpServer = null;
    }

    if (this.statsServer) {
      this.statsServer.close(() => {
        if (this.options.logging === 'true') {
          console.log('Stats service stopped');
        }
      });
      this.statsServer = null;
    }
  };
}

module.exports = FayeServer;
