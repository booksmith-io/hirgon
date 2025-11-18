// users db methods

const dbh = require('./../lib/dbh');

const get = async (selector) => {
    return await dbh('users')
        .where(selector)
        .select('user_id', 'name', 'email', 'passwd', 'active', 'created_at', 'updated_at');
};

const update = async (selector, updates) => {
    return await dbh('users').where(selector).update(updates);
};

const create = async (inserts) => {
    return await dbh('users').insert(inserts);
};

module.exports.get = get;
module.exports.update = update;
module.exports.create = create;
