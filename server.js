var http = require('http');
var faye = require('faye');


// Configuration options
var options = {
    port: process.env.FAYE_PORT || 8080,
    mount: process.env.FAYE_MOUNT ||  '/bayeux',
    timeout: process.env.FAYE_TIMEOUT ||  45,
    logging: process.env.FAYE_LOGGING || 'false',
    stats: process.env.FAYE_STATS || 'false',
    statsPort: process.env.FAYE_STATS_PORT || 1936
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


// Collect statistics
var statistics = {
    connections : 0,
    subscriptions : 0,
    messages : 0
}

if (options.stats === 'true') {
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

if (options.stats === 'true') {
    var statsServer = http.createServer(function(request, response) {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(statistics, null, 2));
    });
    statsServer.listen(options.statsPort);
}

var httpServer = http.createServer();
bayeux.attach(httpServer);
httpServer.listen(options.port);
