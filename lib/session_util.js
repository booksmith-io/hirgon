// methods for interacting with the session

const model = {
    systemdata: require("./../models/systemdata"),
};

const build_config = (session, config) => {
    const path = require("path");
    const sqlite = require("better-sqlite3");
    const sqlite_store = require("better-sqlite3-session-store")(session);
    const db = new sqlite(path.resolve(__dirname, "./../db/sessions.sqlite3"));

    let session_config = {
        store: new sqlite_store({
            client: db,
            expired: {
                clear: true,
                intervalMs: 300000,  // 5 mins
            },
        }),
        secret: "",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: "",
            maxAge: 24 * 60 * 60 * 1000 * 3,  // 3 days
            httpOnly: true,
            sameSite: "strict",
        },
        name: "hirgon.sid",
    };

    // Default to production if NODE_ENV is not set or invalid
    if (!process.env.NODE_ENV ||
        (process.env.NODE_ENV !== "development" &&
         process.env.NODE_ENV !== "production" &&
         process.env.NODE_ENV !== "test")) {
        process.env.NODE_ENV = "production";
    }

    if (process.env.NODE_ENV === "development") {
        session_config.secret = config.session.secret.development;
        session_config.cookie.secure = false;
    } else {
        session_config.secret = config.session.secret.production;
        session_config.cookie.secure = true;
    }

    return session_config;
};

const empty_session = (req) => {
    for (key in req.session) {
        if (key !== "cookie") {
            delete req.session[key];
        }
    }
    return;
};

const get_alert = (req) => {
    let alert;
    if (req.session && "alert" in req.session) {
        alert = req.session["alert"];
        delete req.session["alert"];
    }
    return alert;
};

const set_alert = (req, data) => {
    req.session["alert"] = data;
    return;
};

module.exports.build_config = build_config;
module.exports.empty_session = empty_session;
module.exports.get_alert = get_alert;
module.exports.set_alert = set_alert;
