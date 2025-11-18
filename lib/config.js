// application settings

const fs = require('fs');
const path = require('path');

const config = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, './../.hirgonrc'), 'utf8'),
);

// do some light verification to make sure required values are set
if (!config.app || !config.session) {
    throw 'config app and config session sections are required';
}

if (config.session.secret) {
    if (process.env.NODE_ENV === 'development') {
        if (!config.session.secret.development) {
            throw 'config app.session.secret.development is required';
        }
    } else if (!config.session.secret.production) {
        throw 'config app.session.secret.production is required';
    }
} else {
    throw 'config app.session.secret is required';
}

module.exports = config;
