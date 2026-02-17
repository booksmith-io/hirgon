// security headers middleware

const helmet = require("helmet");

const is_development = process.env.NODE_ENV === "development";

const headers = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            manifestSrc: ["'self'"],
            upgradeInsecureRequests: null,
        },
    },
    hsts: is_development ? false : {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
    noSniff: true,
    frameguard: { action: "deny" },
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

module.exports.headers = headers;
