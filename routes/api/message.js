// api/message routes

const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const secure = require('./../../lib/secure');
const html = require('./../../lib/html');
const response = require('./../../lib/response');
const datetime = require('./../../lib/datetime');
const session_util = require('./../../lib/session_util');

const model = {
    messages: require('./../../models/messages'),
};

router.use(body_parser.urlencoded({ extended: true }));

router.get('/:message_id', secure.protected, async (req, res) => {
    const message_id = req.params.message_id;

    const messages_obj = new model.messages.Messages();
    let messages = await messages_obj.get({ 'message_id': message_id });
    if (!messages) {
        res.status(response.status.HTTP_NOT_FOUND.code)
            .json({ "message": response.status.HTTP_NOT_FOUND.string });
        return;
    }

    res.json(messages[0]);
});

router.post('/:message_id', secure.protected, async (req, res) => {
    const message_id = req.params.message_id;

    const messages_obj = new model.messages.Messages();
    const messages = await messages_obj.get({ 'message_id': message_id });
    if (!messages) {
        res.status(response.status.HTTP_NOT_FOUND.code)
            .json({ "message": response.status.HTTP_NOT_FOUND.string });
        return;
    }

    let updates = {};

    // only update the message columns that have changed
    if (req.body.name && messages[0].name !== req.body.name) {
        updates['name'] = req.body.name;
    }
    if (req.body.body && messages[0].body !== req.body.body) {
        updates['body'] = req.body.body;
    }
    if (messages[0].active === 0 && req.body.active === '1') {
        updates['active'] = 1;
    }
    if (messages[0].active === 1 && (!req.body.active || req.body.active === '0')) {
        updates['active'] = 0;
    }

    if (Object.keys(updates).length === 0) {
        res.status(response.status.HTTP_NO_CONTENT.code)
            .json({ "message": response.status.HTTP_NO_CONTENT.string });
        return;
    }

    const ret = messages_obj.update({ 'message_id': message_id }, updates);
    if (!ret) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code)
            .json({ "message": response.status.HTTP_INTERNAL_SERVER_ERROR.string });
        return;
    }

    res.status(response.status.HTTP_OK.code)
        .json({ "message": "OK" });
    return;
});

router.delete('/:message_id', secure.protected, async (req, res) => {
    const message_id = req.params.message_id;

    const messages_obj = new model.messages.Messages();
    let messages = await messages_obj.get({ 'message_id': message_id });
    if (!messages) {
        res.status(response.status.HTTP_NOT_FOUND.code)
            .json({ "message": response.status.HTTP_NOT_FOUND.string });
        return;
    }

    const ret = messages_obj.remove({ 'message_id': message_id });
    if (!ret) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code)
            .json({ "message": response.status.HTTP_INTERNAL_SERVER_ERROR.string });
        return;
    }

    res.status(response.status.HTTP_OK.code)
        .json({ "message": "OK" });
    return;
});

router.post('/', secure.protected, async (req, res) => {
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
        inserts['active'] = 1;
    }

    const messages_obj = new model.messages.Messages();
    const ret = messages_obj.create(inserts);
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
