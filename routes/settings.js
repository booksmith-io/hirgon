// settings routes

const express = require('express');
const router = express.Router();
const secure = require('./../lib/secure');

router.get('/', secure.protected, (req, res) => {
    res.render('settings', {
        layout: false,
    });
});

module.exports = router;
