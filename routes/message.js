// message routes

const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const secure = require('./../lib/secure');
const html = require('./../lib/html');
const response = require('./../lib/response');
const datetime = require('./../lib/datetime');
const session_util = require('./../lib/session_util');

const model = {
    messages: require('./../models/messages'),
};

router.use(body_parser.urlencoded({ extended: true }));

router.get('/:message_id', secure.protected, async (req, res) => {
    const message_id = req.params.message_id;

    let messages = await model.messages.get({ 'message_id': message_id });
    for (let entry of messages) {
        entry['body'] = html.replace_newlines(entry.body);
    }

    res.json(messages[0]);
});

router.delete('/:message_id', async (req, res) => {
    const message_id = req.params.message_id;

    let messages = await model.messages.get({ 'message_id': message_id });
    if (!messages) {
        res.status(response.status.HTTP_NOT_FOUND.code)
            .json({ "message": response.status.HTTP_NOT_FOUND.string });
        return;
    }

    const ret = model.messages.remove({ 'message_id': message_id });
    if (!ret) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code)
            .json({ "message": response.status.HTTP_INTERNAL_SERVER_ERROR.string });
        return;
    }

    res.status(response.status.HTTP_OK.code)
        .json({ "message": "OK" });
    return;
});

router.post('/', async (req, res) => {
    if (!req.body.name || !req.body.body) {
        res.status(response.status.HTTP_BAD_REQUEST.code)
            .json({ "message": "The name and body parameters are required" });
        return;
    }

    let inserts = {
        name: req.body.name,
        body: req.body.body,
    };

    if (req.body.active) {
        inserts['active_at'] = await datetime.localtime();
    }

    const ret = model.messages.create(inserts);
    if (!ret) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code)
            .json({ "message": response.status.HTTP_INTERNAL_SERVER_ERROR.string });
        return;
    }

    res.status(response.status.HTTP_OK.code)
        .json({ "message": "OK" });
    return;
});

module.exports = router;
