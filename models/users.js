// users model

const base = require('./base');

class Users extends base.Base {
    constructor() {
        super();
    }

    async get (selector) {
        return await super.get(
            [
                'user_id',
                'name',
                'email',
                'passwd',
                'active',
                'created_at',
                'updated_at',
            ],
            selector,
        );
    };

    check_passwd_complexity (password) {
        if (!password) {
            return [false, 'The password argument is required'];
        }

        // validate the password meets minimum requirements before hashing.
        // must be at least 12 characters
        if (password.length < 12) {
            return [false, 'The password argument must be at least 12 characters'];
        }

        // must have at least 1 uppercase character
        // must have at least 1 lowercase character
        // must have at least 1 numeric character
        let password_checks = {
            uppercase: new RegExp('[A-Z]+'),
            lowercase: new RegExp('[a-z]+'),
            numeric: new RegExp('\\d+'),
        };

        for (let check in password_checks) {
            if (!password_checks[check].test(password)) {
                return [
                    false,
                    `The password argument must have at least 1 ${check} character`,
                ];
            }
        }

        return true;
    };
}

module.exports.Users = Users;
