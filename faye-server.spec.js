var faye = require('faye');
var FayeServer = require('./faye-server');

describe("Faye server", function() {

  var serverOptions = {
    FAYE_PORT: 9099
  }

  it('can be started and stopped', function() {
    var server = new FayeServer(serverOptions);
    server.start();
    server.stop();
    server.start();
    server.stop();
  });

  it('cannot be started twice', function() {
    var server = new FayeServer(serverOptions);
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

    it('supports subscription to channel', function(done) {
      let subscription = client.subscribe('/channel123');
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


});
