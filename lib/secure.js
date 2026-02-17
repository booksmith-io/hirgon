// middleware to verify secure routes

const response = require("./../lib/response");
const session_util = require("./../lib/session_util");

const requireAuth = (req, res, next) => {
    if (req.session && req.session.authenticated === true) {
        next();
    } else {
        if (
            req["locals"] !== undefined &&
            req.locals["api"] !== undefined &&
            req.locals.api === true
        ) {
            res.status(response.status.HTTP_UNAUTHORIZED.code)
                .json({
                    message: response.status.HTTP_UNAUTHORIZED.string,
                });
            return;
        } else {
            session_util.empty_session(req);
            session_util.set_alert(req, {
                type: "info",
                message: response.status.HTTP_UNAUTHORIZED.string,
            });
            res.status(response.status.HTTP_UNAUTHORIZED.code)
                .redirect(
                    "/login",
                );
            return;
        }
    }
};

module.exports.requireAuth = requireAuth;
module.exports.protected = requireAuth; // Keep for backward compatibility
