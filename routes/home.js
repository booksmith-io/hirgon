// home routes

const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const secure = require('./../lib/secure');
const messages = require('./../models/messages');
const html = require('./../lib/html');
const response = require('./../lib/response');
const datetime = require('./../lib/datetime');

router.use(body_parser.urlencoded({ extended: true }));

router.get('/', secure.protected, async (req, res) => {
    let message = await messages.get({});
    for (let entry of message) {
        entry['body'] = html.replace_newlines(entry.body);
    }

    res.render('home', {
        layout: false,
        messages: message,
    });
});

router.post('/', async (req, res) => {
    if (!req.body.name || !req.body.body) {
        res.status(response.status.HTTP_UNAUTHORIZED.code).render('error', {
            layout: false,
            alert: {
                type: 'danger',
                message: 'The name and body parameters are required',
            },
        });
        return;
    } else {
        let inserts = {
            name: req.body.name,
            body: req.body.body,
        };

        if (req.body.active) {
            inserts['active_at'] = await datetime.localtime();
        }

        const ret = messages.create(inserts);
        if (ret) {
            res.redirect('/');
        } else {
            return;
        }
    }
});

module.exports = router;
