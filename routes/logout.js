// logout route

const express = require("express");
const router = express.Router();
const body_parser = require("body-parser");
const session_util = require("./../lib/session_util");

router.use(body_parser.urlencoded({ extended: true }));

router.get("/", (req, res) => {
    session_util.empty_session(req);
    session_util.set_alert(req, {
        type: "info",
        message: "You've been logged out",
    });
    res.redirect("/login");
});

module.exports = router;
