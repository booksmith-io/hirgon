// users db methods

const dbh = require('./../lib/dbh');

const get = async (selector) => {
    return await dbh('users')
        .where(selector)
        .select(
            'user_id',
            'name',
            'email',
            'passwd',
            'active',
            'created_at',
            'updated_at',
        );
};

const update = async (selector, updates) => {
    return await dbh('users').where(selector).update(updates);
};

const create = async (inserts) => {
    return await dbh('users').insert(inserts);
};

const check_passwd_complexity = (password) => {
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

module.exports.get = get;
module.exports.update = update;
module.exports.create = create;
module.exports.check_passwd_complexity = check_passwd_complexity;
