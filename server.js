var http = require('http');
var faye = require('faye');


// Configuration options
var options = {
    logging: process.env.FAYE_LOGGING || 'false',
    listenPort: process.env.FAYE_PORT || 8080,
    mount: process.env.FAYE_MOUNT ||  '/bayeux',
    timeout: process.env.FAYE_TIMEOUT ||  45
};

console.log('Running Faye server\n' + JSON.stringify(options, null, 2));


// Configure adapter
var bayeux = new faye.NodeAdapter({mount: options.mount, timeout: options.timeout});


// Log client connections + subscriptions
if (options.logging === 'true') {

    bayeux.on('handshake', function(clientId) {
        console.log('[' + new Date() + '] Client ' + clientId + ' connected');
    });

    bayeux.on('disconnect', function(clientId) {
        console.log('[' + new Date() + '] Client ' + clientId+ ' disconnected');
    });

    bayeux.on('subscribe', function(clientId, channel) {
        console.log('[' + new Date() + '] Client ' + clientId + ' subscribed to ' + channel);
    });

    bayeux.on('unsubscribe', function(clientId, channel) {
        console.log('[' + new Date() + '] Client ' + clientId + ' unsubscribed from ' + channel);
    });
}


// Set up server
var httpServer = http.createServer();
bayeux.attach(httpServer);
httpServer.listen(options.listenPort);
