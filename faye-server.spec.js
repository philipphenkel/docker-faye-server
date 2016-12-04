let faye = require('faye');
let FayeServer = require('./faye-server');

describe("Faye server", function() {

  it('can be configured', function() {
    let nonDefaultOptions = {
      FAYE_PORT: 9999,
      FAYE_MOUNT: '/mount',
      FAYE_TIMEOUT: 9999,
      FAYE_LOGGING: 'true',
      FAYE_STATS_PORT: 9999,
      FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT: 'true'
    }
    let server = new FayeServer(nonDefaultOptions);
    expect(server.options.port).toEqual(nonDefaultOptions.FAYE_PORT);
    expect(server.options.mount).toEqual(nonDefaultOptions.FAYE_MOUNT);
    expect(server.options.timeout).toEqual(nonDefaultOptions.FAYE_TIMEOUT);
    expect(server.options.logging).toEqual(nonDefaultOptions.FAYE_LOGGING);
    expect(server.options.statsPort).toEqual(nonDefaultOptions.FAYE_STATS_PORT);
    expect(server.options.wildcardSubscriptionOnRoot).toEqual(nonDefaultOptions.FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT);
  });

  it('can be started and stopped', function() {
    let server = new FayeServer();
    server.start();
    server.stop();
    server.start();
    server.stop();
  });

  it('cannot be started twice', function() {
    let server = new FayeServer();
    server.start();
    expect(server.start).toThrow();
    server.stop();
  });

  describe('with default options', function() {
    let server = new FayeServer();
    let client = null;

    beforeEach(function() {
      client = new faye.Client('http://localhost:' + server.options.port + server.options.mount);
      server.start();
    });

    it('supports subscription to a channel', function(done) {
      let subscription = client.subscribe('/channel123');
      subscription.then(function() {
        done();
      });
    });

    it('supports wildcard subscription to /channel123/*', function(done) {
      let subscription = client.subscribe('/channel123/*');
      subscription.then(function() {
        done();
      });
    });

    it('supports publication of a message', function(done) {
      let publication = client.publish('/channel123', {
        text: 'Hello, World!'
      });
      publication.then(function() {
        done();
      });
    });

    it('forbids wildcard subscription on root', function(done) {
      let subscription = client.subscribe('/*');
      subscription.then(function() {
        fail('wildcard subscription on root shall not be allowed');
        done();
      }, function(error) {
        done();
      });
    });

    it('forbids recursive wildcard subscription on root', function(done) {
      let subscription = client.subscribe('/**');
      subscription.then(function() {
        fail('recursive wildcard subscription on root shall not be allowed');
        done();
      }, function(error) {
        done();
      });
    });

    afterEach(function() {
      server.stop();
    });
  });

  describe('with enabled wildcard subscription on root', function() {
    let server = new FayeServer({wildcardSubscriptionOnRoot:'true'});
    let client = null;

    beforeEach(function() {
      client = new faye.Client('http://localhost:' + server.options.port + server.options.mount);
      server.start();
    });

    it('supports wildcard subscription on root', function(done) {
      let subscription = client.subscribe('/*');
      subscription.then(function() {
        done();
      });
    });

    it('supports recursive wildcard subscription on root', function(done) {
      let subscription = client.subscribe('/**');
      subscription.then(function() {
        done();
      });
    });

    afterEach(function() {
      server.stop();
    });
  });

});
