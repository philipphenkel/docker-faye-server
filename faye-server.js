let http = require('http');
let faye = require('faye');
let extensions = require('./faye-extensions');
let utils = require('./faye-utils');

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
    this.statistics = {};
  }


  start() {
    if (this.httpServer) {
      throw new Error('Server is already running on port ' + this.options.port);
    }

    if (this.options.logging === 'true') {
      console.log('Starting Faye server\n' + JSON.stringify(this.options, null, 2));
    }

    var bayeux = new faye.NodeAdapter({
      mount: this.options.mount,
      timeout: this.options.timeout
    });

    if (!(this.options.wildcardSubscriptionOnRoot === 'true')) {
      bayeux.addExtension(extensions.forbidWildcardSubscriptionOnRoot);
    }

    if (this.options.logging === 'true') {
      utils.enableLoggingOfConnections(bayeux);
      utils.enableLoggingOfSubscriptions(bayeux);
    }

    this.httpServer = http.createServer();
    bayeux.attach(this.httpServer);
    this.httpServer.listen(this.options.port);

    if (this.options.stats === 'true') {
      utils.enableStatistics(bayeux, this.statistics);
      this.statsServer = http.createServer(utils.statisticsRequestListener(this.statistics)); 
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
