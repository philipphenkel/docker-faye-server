Faye Server [![Build Status](https://travis-ci.org/henkel/docker-faye-server.svg?branch=master)](https://travis-ci.org/henkel/docker-faye-server)
===========

Faye is a publish-subscribe messaging system based on the Bayeux protocol. It is designed to allow client-side JavaScript programs to send messages to each other with low latency over HTTP.

This project provides a Faye server which is based on Node.js and a corresponding Docker container. Faye's in-process memory engine is used to store the state.

Direct Usage
------------
Start a server at port 8080 with the following two commands

```console
npm install
npm start
```

Several configuration options are supported via the environment variables listed below.

Docker Usage
------------

Faye is exposed at port 80. In order to run a server at port 8080, just call

```console
docker run --rm -i -t -p 8080:80 henkel/docker-faye-server:latest
```

The server is configurable via environment variables, e.g. logging can be enabled like this

```console
docker run --rm -i -t -p 8080:80 -e FAYE_LOGGING=true henkel/docker-faye-server:latest
```

If statistics are enabled a JSON object is accessible via HTTP
```console
docker run -d -p 8080:80 -p 1936:1936 -e FAYE_STATS=true henkel/docker-faye-server:latest
curl 127.0.0.1:1936
```

Environment Variables
---------------------
Variable | Description
-------- | -----------
`FAYE_MOUNT` | The path on the host at which the Faye service is provided. The default value is /bayeux and clients would have to connect to `http://host:port/bayeux`. The server will handle any request whose path begins with the mount path; this is so that it can interoperate with clients that use different request paths for different channels.
`FAYE_TIMEOUT` | The maximum time to hold a connection open before returning the response. This is given in seconds and must be smaller than the timeout on your web front-end. Default timeout is 45 seconds.
`FAYE_LOGGING` | If set to `true` connections and subscriptions will be logged. `false` by default.
`FAYE_STATS` | If set to `true` statistics provided at `http://host:FAYE_STATS_PORT`. `false` by default.
`FAYE_STATS_PORT` | The port at which statistics are served via HTTP. `1936` by default.
`FAYE_WILDCARD_SUBSCRIPTION_ON_ROOT` | Enables wildcard subscriptions on root. For privacy reasons `false` by default.

License
-------

Copyright (C) 2016-2017 Philipp Henkel

Licensed under the MIT License (MIT). See LICENSE file for more details.
