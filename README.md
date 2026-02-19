![hirgon](hirgon.jpeg)

# hirgon

Messenger of Gondor.

## DESCRIPTION

`hirgon` is a web application for scheduling message content.

Messages may be added, deleted, set active, or scheduled to be made active at a later date.

NOTE: this project is still WIP and missing several key features...

## INSTALLATION

### install system dependencies

- git
- npm
- nodejs
- sqlite3
- make

### install and setup the application

```
git clone git@github.com:booksmith-io/hirgon.git
cd hirgon
npm run setup
cp -a .hirgonrc.example .hirgonrc
```

### configuration

The configuration file contains the following keys and values:

#### `app`

The `app` section defines the application specific configuration.

```
"app": {
    "name": "hirgon",
    "port": 5000,
    "address": "0.0.0.0"
}
```

- `name` is required and controls the name of the running app
- `port` is required and is the port to bind the app to when running the application
- `address` is required and is the IP address to bind the app to when running the application

#### `ratelimits`

The `ratelimits` section controls enabling and configuring ratelimiting per IP.

```
"ratelimits": {
    "enabled": 0,
    "requests_threshold": 7,
    "block_seconds": 300
}
```

- `enabled` is required and takes either 0 or 1 to disable or enable
- `requests_threshold` is required and takes a positive integer for how many requests per second before the IP is blocked
- `block_seconds` is required and takes a positive integer for how many seconds the IP is blocked after reaching the `requests_threshold`

#### `user_agent_blocks`

The `user_agent_blocks` section controls enabling and configuring user agents that shouldn't be allowed to access the app.

```
"user_agent_blocks": {
    "enabled": 0,
    "user_agents": [
        "facebookexternalhit",
        "facebookscraper",
        "openai",
        "OAI-SearchBot",
        "amazonbot",
        "Cortex-Xpanse"
    ]
}
```

- `enabled` is required takes either 0 or 1 to disable or enable
- `user_agents` is required and takes an array of user agent strings to match for blocking access
    - if a user agent in the list is making the request, a 406 (unacceptable) is returned
    - the user agent string is case insensitive and can be found anywhere in the user agent string making the request

### run the development server

```
npm run development
```

### update the application

```
npm run upgrade
npm run update_deps
npm run upgrade_database
```

### run in production

#### add to systemd

```
cat << EOF > /etc/systemd/system/hirgon.service
[Service]
RuntimeDirectory=hirgon
ExecStart=/usr/bin/npm run start server.js
WorkingDirectory=/home/hirgon/git/hirgon/
Restart=always

StandardError=syslog
SyslogIdentifier=spicyipsum

Type=simple
User=hirgon
Group=hirgon

Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
```

```
systemctl enable hirgon.service
systemctl start hirgon.service
```

#### add the proxy configuration to the webserver

##### apache2

within the appropriate vhost

```
ProxyPreserveHost on
ProxyPass / http://localhost:5000/
ProxyPassReverse / http://localhost:5000/
```

##### nginx

within the appropriate vhost

```
location / {
    proxy_pass         http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header   Host $host;
}
```

## COPYRIGHT AND LICENSE

hirgon is Copyright (c) 2025 Blaine Motsinger under the MIT license.
