var faye = require('faye');
var FayeServer = require('./faye-server');

describe("Faye server", function() {

  var defaultOptions = {
    FAYE_PORT: 9099
  }

  it('can be started and stopped', function() {
    var server = new FayeServer(defaultOptions);
    server.start();
    server.stop();
    server.start();
    server.stop();
  });

  it('cannot be started twice', function() {
    var server = new FayeServer(defaultOptions);
    server.start();
    expect(server.start).toThrow();
    server.stop();
  });

  describe('supports', function() {
    let server = new FayeServer(defaultOptions);
    let client = null;

    beforeEach(function() {
      client = new faye.Client('http://localhost:' + server.options.port + server.options.mount);
      server.start();
    });

    it('subscription to channel', function(done) {
      let subscription = client.subscribe('/channel123');
      subscription.then(function() {
        done();
      });
    });

    it('publication of a message', function(done) {
      let publication = client.publish('/channel123', {text: 'Hello, World!'});
      publication.then(function() {
        done();
      });
    });

    afterEach(function() {
      server.stop();
    });
  });


});
