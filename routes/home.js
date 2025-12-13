// home routes

const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const secure = require('./../lib/secure');
const html = require('./../lib/html');
const response = require('./../lib/response');
const datetime = require('./../lib/datetime');

const model = {
    messages: require('./../models/messages'),
};

router.use(body_parser.urlencoded({ extended: true }));

router.get('/', secure.protected, async (req, res) => {
    const messages_obj = new model.messages.Messages();
    let messages = await messages_obj.get({});
    for (let entry of messages) {
        entry['body'] = html.replace_newlines(entry.body);
    }

    res.render('home', {
        layout: false,
        messages: messages,
    });
});

module.exports = router;
