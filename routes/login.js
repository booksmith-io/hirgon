// login route

const express = require('express');
const router = express.Router();
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');
const response = require('./../lib/response');
const session_util = require('./../lib/session_util');

const model = {
    users: require('./../models/users'),
};

router.use(body_parser.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    if (
         req.session &&
         req.session.authenticated === true
    ) {
        req.session.regenerate((err) => {
            if (err) {
                console.error(err);
            }
        });
        res.redirect('/');
    } else {
        res.render(
            'login',
            {
                layout: false,
                alert: session_util.get_alert(req),
            },
        );
    }
});

router.post('/', async (req, res) => {
    if (!req.body || !req.body.email || !req.body.password) {
        res.status(response.status.HTTP_UNAUTHORIZED.code).render('login', {
            layout: false,
            alert: {
                type: 'danger',
                message: 'The email and password parameters are required',
            },
        });
        return;
    } else {
        const user = await model.users.get({ email: req.body.email });
        if (
            user[0] &&
            bcrypt.compareSync(req.body.password, user[0].passwd)
        ) {
            session_util.empty_session(req);
            req.session.regenerate((err) => {
                if (err) {
                    console.error(err);
                }
            });
            req.session.authenticated = true;
            req.session.user = {
                user_id: user[0].id,
                name: user[0].name,
                email: user[0].email,
                created_at: user[0].created_at,
                updated_at: user[0].updated_at,
            };
            res.redirect('/');
        } else {
            session_util.empty_session(req);
            res.status(response.status.HTTP_UNAUTHORIZED.code).render('login', {
                layout: false,
                alert: {
                    type: 'danger',
                    message: 'The email and password parameters are required',
                },
            });
        }
    }
});

module.exports = router;
