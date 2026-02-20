// application settings

const fs = require("fs");
const path = require("path");

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./../.hirgonrc"), "utf8"));

// allow environment variable to override session secret
if (process.env.HIRGON_SESSION_SECRET_PRODUCTION) {
    config.session.secret.production = process.env.HIRGON_SESSION_SECRET_PRODUCTION;
}

if (config["app"] === undefined) {
    throw "config app section is required";
}

if (config["session"] === undefined) {
    throw "config session section is required";
}

if (config["session"]["secret"] === undefined) {
    throw "config session secret section is required";
}

if (process.env.NODE_ENV === "development") {
    if (config["session"]["secret"]["development"] === undefined) {
        throw "config session secret development is required";
    }
// session_util sets env to production is NODE_ENV is unset or invalid
// so then here we need to verify production secret is set if we're not
// development.
} else if (config["session"]["secret"]["production"] === undefined) {
    throw "config session secret production is required";
}

for (let key of ["name", "port", "address"]) {
    if (config["app"][key] === undefined) {
        throw `config app ${key} section is required`;
    }
}

for (let key of ["ratelimits", "user_agent_blocks"]) {
    if (config[key] === undefined) {
        throw `config ${key} section is required`;
    }

    if (config[key]["enabled"] === undefined) {
        throw `config ${key} enabled is required`;
    }

    if (config[key]["enabled"] !== 0 && config[key]["enabled"] !== 1) {
        throw `config ${key} enabled must be either a true or false value`;
    }
}

if (config["ratelimits"]["requests_threshold"] === undefined) {
    throw "config ratelimits requests_threshold is required";
}

if (
    !Number.isInteger(config["ratelimits"]["requests_threshold"]) ||
    config["ratelimits"]["requests_threshold"] <= 0
) {
    throw "config ratelimits requests_threshold config section is invalid";
}

if (config["ratelimits"]["block_seconds"] === undefined) {
    throw "config ratelimits block_seconds is required";
}

if (
    !Number.isInteger(config["ratelimits"]["block_seconds"]) ||
    config["ratelimits"]["block_seconds"] <= 0
) {
    throw "config ratelimits block_seconds config section is invalid";
}

if (config["user_agent_blocks"]["user_agents"] === undefined) {
    throw "config user_agent_blocks user_agents is required";
}

if (Array.isArray(config["user_agent_blocks"]["user_agents"]) === false) {
    throw "config user_agent_blocks user_agents isn't an array";
}

module.exports = config;
