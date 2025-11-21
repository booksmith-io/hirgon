// settings routes

const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');
const secure = require('./../lib/secure');
const response = require('./../lib/response');

const model = {
    users: require('./../models/users'),
};

router.use(body_parser.urlencoded({ extended: true }));

router.get('/', secure.protected, (req, res) => {
    res.redirect('settings/profile');
});

router.get('/profile', secure.protected, (req, res) => {
    res.render('settings/profile', {
        layout: false,
    });
});

router.post('/profile', secure.protected, async (req, res) => {
    if (!req.body || !req.body.name || !req.body.email) {
        res.status(response.status.HTTP_BAD_REQUEST.code).render('settings/profile', {
            layout: false,
            alert: {
                type: 'danger',
                message: 'The name and email parameters are required',
            },
        });
        return;
    }

    let updates = {
        name: req.body.name,
        email: req.body.email,
    };

    const ret = await model.users.update({ 'user_id': res.locals.user.user_id }, updates);
    if (!ret) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code).render('settings/profile', {
            layout: false,
            alert: {
                type: 'danger',
                message: 'Unable to update profile',
            },
        });
        return;
    }

    // anytime a user is updated, we need to update that user information in session and req.local
    // since they're used in other places within the software.
    const users = await model.users.get({ 'user_id': res.locals.user.user_id });
    req.session.user = {
        user_id: users[0].user_id,
        name: users[0].name,
        email: users[0].email,
        active: users[0].active,
        created_at: users[0].created_at,
        updated_at: users[0].updated_at,
    };
    res.locals.user = req.session.user;

    res.render('settings/profile', {
        layout: false,
        alert: {
            type: 'info',
            message: 'Profile updated',
        },
    });
    return;
});

router.get('/password', secure.protected, (req, res) => {
    res.render('settings/password', {
        layout: false,
    });
});

router.post('/password', secure.protected, async (req, res) => {
    if (!req.body || !req.body.old_password || !req.body.new_password || !req.body.confirm_new_password) {
        res.status(response.status.HTTP_BAD_REQUEST.code).render('settings/password', {
            layout: false,
            alert: {
                type: 'danger',
                message: 'The old, new, and confirm passwords are required',
            },
        });
        return;
    }

    // check the old password
    let users = await model.users.get({ 'user_id': res.locals.user.user_id });
    if (!bcrypt.compareSync(req.body.old_password, users[0].passwd)) {
        res.status(response.status.HTTP_UNAUTHORIZED.code).render('settings/password', {
            layout: false,
            alert: {
                type: 'danger',
                message: 'The old password was not correct',
            },
        });
        return;
    }

    const new_passwd_hash = bcrypt.hashSync(req.body.new_password, 10);

    // check that the new and confirm passwords match
    if (!bcrypt.compareSync(req.body.confirm_new_password, new_passwd_hash)) {
        res.status(response.status.HTTP_BAD_REQUEST.code).render('settings/password', {
            layout: false,
            alert: {
                type: 'danger',
                message: "The new and confirm passwords don't match",
            },
        });
        return;
    }

    // now that we've verified the passwords, update the password in the database
    let ret = await model.users.update({ 'user_id': res.locals.user.user_id }, { passwd: new_passwd_hash });
    if (!ret) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code).render('settings/password', {
            layout: false,
            alert: {
                type: 'danger',
                message: 'Unable to update password',
            },
        });
        return;
    }

    // anytime a user is updated, we need to update that user information in session and req.local
    // since they're used in other places within the software.
    users = await model.users.get({ 'user_id': res.locals.user.user_id });
    req.session.user = {
        user_id: users[0].user_id,
        name: users[0].name,
        email: users[0].email,
        active: users[0].active,
        created_at: users[0].created_at,
        updated_at: users[0].updated_at,
    };
    res.locals.user = req.session.user;

    res.render('settings/password', {
        layout: false,
        alert: {
            type: 'info',
            message: 'Password updated',
        },
    });
    return;
});

module.exports = router;
