const http = require('http');
const faye = require('faye');
const extensions = require('./faye-extensions');
const utils = require('./faye-utils');

class FayeServer {
  constructor(options = {}) {
    this.options = {
      FAYE_PORT: options.FAYE_PORT || 8080,
      FAYE_MOUNT: options.FAYE_MOUNT || '/bayeux',
      FAYE_TIMEOUT: options.FAYE_TIMEOUT || 45,
      FAYE_LOG_LEVEL: options.FAYE_LOG_LEVEL || 0,
      FAYE_STATS: options.FAYE_STATS || 'false',
      FAYE_STATS_PORT: options.FAYE_STATS_PORT || 1936,
      FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT: options.FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT || 'false'
    };
    this.httpServer = null;
    this.statsServer = null;
    this.statistics = {};
  }


  start() {
    if (this.httpServer) {
      throw new Error('Server is already running on port ' + this.options.FAYE_PORT);
    }

    if (this.options.FAYE_LOG_LEVEL >= 1) {
      console.log('Starting Faye server\n' + JSON.stringify(this.options, null, 2));
    }

    var bayeux = new faye.NodeAdapter({
      mount: this.options.FAYE_MOUNT,
      timeout: this.options.FAYE_TIMEOUT
    });

    if (!(this.options.FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT === 'true')) {
      bayeux.addExtension(extensions.forbidWildcardSubscriptionOnRoot);
    }

    if (this.options.FAYE_LOG_LEVEL >= 1) {
      utils.enableLoggingOfConnections(bayeux);
      utils.enableLoggingOfSubscriptions(bayeux);
    }

    if (this.options.FAYE_LOG_LEVEL >= 2) {
      utils.enableLoggingOfPublications(bayeux);
    }

    this.httpServer = http.createServer();
    bayeux.attach(this.httpServer);
    this.httpServer.listen(this.options.FAYE_PORT);

    if (this.options.FAYE_STATS === 'true') {
      utils.enableStatistics(bayeux, this.statistics);
      this.statsServer = http.createServer(utils.statisticsRequestListener(this.statistics));
      this.statsServer.listen(this.options.FAYE_STATS_PORT);
    }
  };


  stop() {
    if (this.options.FAYE_LOG_LEVEL >= 1) {
      console.log('Stopping server at port ' + this.options.FAYE_PORT);
    }

    if (this.httpServer) {
      this.httpServer.close(() => {
        if (this.options.FAYE_LOG_LEVEL >= 1) {
          console.log('Faye service stopped');
        }
      });
      this.httpServer = null;
    }

    if (this.statsServer) {
      this.statsServer.close(() => {
        if (this.options.FAYE_LOG_LEVEL >= 1) {
          console.log('Stats service stopped');
        }
      });
      this.statsServer = null;
    }
  };
}

module.exports = FayeServer;
