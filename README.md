Faye Server
===========

Faye is a publish-subscribe messaging system based on the Bayeux protocol. It is designed to allow client-side JavaScript programs to send messages to each other with low latency over HTTP.

The Docker image contains a Faye server which is based on Node.js. The server uses the in-process memory engine to store its state.

Usage
-----

By default port 80 is exposed. In order to run a server at port 8080, just call

```console
docker run --rm -i -t -p 8080:80 henkel/docker-faye-server:latest
```

The server is configurable via environment variable, e.g. logging can enabled like this

```console
docker run --rm -i -t -p 8080:80 -e FAYE_LOGGING=true henkel/docker-faye-server:latest
```

Statistics are available via web interface at /stats
```console
curl
```

Environment Variables
---------------------

`FAYE_LOGGING` - If set to `true` connections and subscriptions will be logged. `false` by default.

`FAYE_MOUNT` - The path on the host at which the Faye service is available. The default value is /bayeux and clients would have to connect to `http://host/bayeux` to talk to the server. The server will handle any request whose path begins with the mount path; this is so that it can interoperate with clients that use different request paths for different channels.

`FAYE_TIMEOUT` - The maximum time to hold a connection open before returning the response. This is given in seconds and must be smaller than the timeout on your web front-end. Default timeout is 45 seconds.



License
-------

Copyright (C) 2016 Philipp Henkel

Licensed under the MIT License (MIT). See LICENSE file for more details.
