// settings routes

const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');
const secure = require('./../lib/secure');
const response = require('./../lib/response');

const model = {
    users: require('./../models/users'),
    systemdata: require('./../models/systemdata'),
};

router.use(body_parser.urlencoded({ extended: true }));

router.get('/', secure.protected, (req, res) => {
    res.redirect('settings/profile');
});

router.get('/profile', secure.requireAuth, (req, res) => {
    res.render('settings/profile', {
        layout: false,
    });
});

router.post('/profile', secure.requireAuth, async (req, res) => {
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

    let users_obj = new model.users.Users();

    let updates = {
        name: req.body.name,
        email: req.body.email,
    };

    const ret = await users_obj.update({ 'user_id': res.locals.user.user_id }, updates);
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
    const users = await users_obj.get({ 'user_id': res.locals.user.user_id });
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

router.get('/password', secure.requireAuth, (req, res) => {
    res.render('settings/password', {
        layout: false,
    });
});

router.post('/password', secure.requireAuth, async (req, res) => {
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

    let users_obj = new model.users.Users();

    // check the old password
    let users = await users_obj.get({ 'user_id': res.locals.user.user_id });
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
    let ret = await users_obj.update({ 'user_id': res.locals.user.user_id }, { passwd: new_passwd_hash });
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
    users = await users_obj.get({ 'user_id': res.locals.user.user_id });
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

router.get('/icon', secure.requireAuth, async (req, res) => {
    const icons = require('./../lib/icons');

    const systemdata_obj = new model.systemdata.Systemdata();
    const icon = await systemdata_obj.get({ 'key': 'settings:icon' });
    if (!icon[0]) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code).render('settings/icon', {
            layout: false,
            icons: icons.icons,
            alert: {
                type: 'danger',
                message: 'Icon was not found',
            },
        });
        return;
    }

    res.render('settings/icon', {
        layout: false,
        checked: icon[0].value,
        icons: icons.icons,
    });
});

router.post('/icon', secure.requireAuth, async (req, res) => {
    const icons = require('./../lib/icons');

    const systemdata_obj = new model.systemdata.Systemdata();
    const icon = await systemdata_obj.get({ 'key': 'settings:icon' });
    if (!icon[0]) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code).render('settings/icon', {
            layout: false,
            icons: icons.icons,
            alert: {
                type: 'danger',
                message: 'Icon was not found',
            },
        });
        return;
    }

    if (!req.body || !req.body.icon) {
        res.status(response.status.HTTP_BAD_REQUEST.code).render('settings/icon', {
            layout: false,
            checked: icon[0].value,
            icons: icons.icons,
            alert: {
                type: 'danger',
                message: 'Icon is required',
            },
        });
        return;
    }

    let updates = {
        value: req.body.icon
    };

    const ret = await systemdata_obj.update({ 'key': 'settings:icon' }, updates);
    if (!ret) {
        res.status(response.status.HTTP_INTERNAL_SERVER_ERROR.code).render('settings/icon', {
            layout: false,
            checked: icon[0].value,
            icons: icons.icons,
            alert: {
                type: 'danger',
                message: 'Unable to update icon',
            },
        });
        return;
    }

    // update res.locals with the change so it can be used within the templates
    const systemdata = await systemdata_obj.get_format_systemdata({});
    res.locals.systemdata = systemdata;

    res.render('settings/icon', {
        layout: false,
        checked: req.body.icon,
        icons: icons.icons,
        alert: {
            type: 'info',
            message: 'Icon updated',
        },
    });
    return;
});

module.exports = router;
