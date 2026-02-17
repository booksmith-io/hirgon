// CSRF protection middleware

const csrf = require("csurf");

const csrf_protection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    },
});

const get_csrf_token = (req, res, next) => {
    if (req.csrfToken) {
        res.locals.csrf_token = req.csrfToken();
    }
    next();
};

module.exports.csrf_protection = csrf_protection;
module.exports.get_csrf_token = get_csrf_token;
