let faye = require('faye');
let FayeServer = require('./faye-server');

describe("Faye server", () => {

  it('can be started and stopped', () => {
    let server = new FayeServer();
    server.start();
    server.stop();
    server.start();
    server.stop();
  });

  it('cannot be started twice', () => {
    let server = new FayeServer();
    server.start();
    expect(server.start).toThrow();
    server.stop();
  });

  it('can be configured', () => {
    let nonDefaultOptions = {
      FAYE_PORT: 9998,
      FAYE_MOUNT: '/mount',
      FAYE_TIMEOUT: 1000,
      FAYE_LOGGING: 'true',
      FAYE_STATS: 'true',
      FAYE_STATS_PORT: 9999,
      FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT: 'true'
    }
    let server = new FayeServer(nonDefaultOptions);
    expect(server.options.port).toEqual(nonDefaultOptions.FAYE_PORT);
    expect(server.options.mount).toEqual(nonDefaultOptions.FAYE_MOUNT);
    expect(server.options.timeout).toEqual(nonDefaultOptions.FAYE_TIMEOUT);
    expect(server.options.logging).toEqual(nonDefaultOptions.FAYE_LOGGING);
    expect(server.options.stats).toEqual(nonDefaultOptions.FAYE_STATS);
    expect(server.options.statsPort).toEqual(nonDefaultOptions.FAYE_STATS_PORT);
    expect(server.options.wildcardSubscriptionOnRoot).toEqual(nonDefaultOptions.FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT);
    server.start();
    server.stop();
  });

  describe('with default options', () => {
    let server = new FayeServer();
    let client = null;

    beforeEach(() => {
      client = new faye.Client('http://localhost:' + server.options.port + server.options.mount);
      server.start();
    });

    it('supports subscription to a channel', (done) => {
      let subscription = client.subscribe('/channel123');
      subscription.then(() => done());
    });

    it('supports wildcard subscription to /channel123/*', (done) => {
      let subscription = client.subscribe('/channel123/*');
      subscription.then(() => done());
    });

    it('supports publication of a message', (done) => {
      let publication = client.publish('/channel123', {
        text: 'Hello, World!'
      });
      publication.then(() => done());
    });

    it('forbids wildcard subscription on root', (done) => {
      let subscription = client.subscribe('/*');
      subscription.then(() => {
        fail('wildcard subscription on root shall not be allowed');
        done();
      }, (error) => done());
    });

    it('forbids recursive wildcard subscription on root', (done) => {
      let subscription = client.subscribe('/**');
      subscription.then(() => {
        fail('recursive wildcard subscription on root shall not be allowed');
        done();
      }, (error) => done());
    });

    afterEach(() => server.stop());
  });

  describe('with wildcard subscription on root enabled', () => {
    let server = new FayeServer({
      wildcardSubscriptionOnRoot: 'true'
    });
    let client = null;

    beforeEach(() => {
      client = new faye.Client('http://localhost:' + server.options.port + server.options.mount);
      server.start();
    });

    it('supports wildcard subscription on root', (done) => {
      let subscription = client.subscribe('/*');
      subscription.then(() => done());
    });

    it('supports recursive wildcard subscription on root', (done) => {
      let subscription = client.subscribe('/**');
      subscription.then(() => done());
    });

    afterEach(() => server.stop());
  });


  describe('with statistics enabled', () => {
    let server = new FayeServer({
      stats: 'true'
    });

    beforeEach(() => server.start());

    it('tracks connections', (done) => {
      expect(server.statistics.connections).toEqual(0);
      let client = new faye.Client('http://localhost:' + server.options.port + server.options.mount);
      let subscription = client.subscribe('/123');
      subscription.then(() => {
        expect(server.statistics.connections).toEqual(1);
        done();
      });
    });

    it('tracks subscriptions', (done) => {
      expect(server.statistics.subscriptions).toEqual(0);
      let client = new faye.Client('http://localhost:' + server.options.port + server.options.mount);
      let subscription = client.subscribe('/channel123');
      subscription.then(() => {
        expect(server.statistics.subscriptions).toEqual(1);
        done();
      });
    });

    it('tracks messages', (done) => {
      expect(server.statistics.messages).toEqual(0);
      let client = new faye.Client('http://localhost:' + server.options.port + server.options.mount);
      let publication = client.publish('/channel123', {
        text: 'Hello, World!'
      });
      publication.then(() => {
        expect(server.statistics.messages).toEqual(1);
        done();
      });
    });

    afterEach(() => server.stop());
  });

});
