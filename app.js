// hirgon

"use strict";

const version = "0.001";

const express = require("express");
const session = require("express-session");
const path = require("path");
const logger = require("morgan");
const cookie_parser = require("cookie-parser");
const config = require("./lib/config");
const response = require("./lib/response");
const session_util = require("./lib/session_util");
const security = require("./lib/security");

const body_parser = require("body-parser");

const app = express();

app.use(security.headers);
app.use(cookie_parser());
app.use(body_parser.urlencoded({ extended: true }));
app.use(session(session_util.build_config(session, config)));

app.disable("etag");
app.disable("x-powered-by");

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./views"));

const routes = {
    login: require("./routes/login"),
    home: require("./routes/home"),
    api: {
        message: require("./routes/api/message"),
    },
    settings: require("./routes/settings"),
    logout: require("./routes/logout"),
    default_route: require("./routes/default_route"),
};

const model = {
    systemdata: require("./models/systemdata"),
};

app.use(logger("combined"));
app.use(express.static(path.resolve(__dirname, "./public")));

// add some request variables as local response variables so they
// can be used in the templates.
app.use(async (req, res, next) => {
    res.locals.path = req.path;
    res.locals.user = req.session.user;
    res.locals.app = config.app;
    res.locals.config = config;

    if (req.url.includes("/api/")) {
        res.locals.api = true;
    }

    const systemdata_obj = new model.systemdata.Systemdata();
    const systemdata = await systemdata_obj.get_format_systemdata();
    res.locals.systemdata = systemdata;
    next();
});

const csrf = require("./middleware/csrf");
const middleware = {
    csrf_protection: csrf.csrf_protection,
    get_csrf_token: csrf.get_csrf_token,
    fix_trailing_slashes: require("./middleware/fix_trailing_slashes"),
    block_user_agents: require("./middleware/block_user_agents"),
    enforce_ratelimits: require("./middleware/enforce_ratelimits"),
};

// CSRF protection for all routes (needed to generate tokens for forms)
app.use(middleware.csrf_protection);

app.use(middleware.get_csrf_token);
app.use(middleware.fix_trailing_slashes);
app.use(middleware.block_user_agents);
app.use(middleware.enforce_ratelimits);

app.use("/login", routes.login);
app.use("/", routes.home);
app.use("/api/message", routes.api.message);
app.use("/settings", routes.settings);
app.use("/logout", routes.logout);

// default route response
app.use(routes.default_route);

// default route error handling
app.use((err, req, res, next) => {
    console.error(`[error] ${err.stack}`);
    if (res.locals.api) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code)
            .json({
                message: response.status.HTTP_INTERNAL_SERVER_ERROR.string,
            });
    } else {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code)
            .render(
                `${response.status.HTTP_INTERNAL_SERVER_ERROR.code}`,
                {
                    layout: false,
                },
            );
    }
    return;
});

module.exports = app;
