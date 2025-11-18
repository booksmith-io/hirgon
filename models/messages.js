// messages db methods

const dbh = require('./../lib/dbh');

const get = async (selector) => {
    return await dbh('messages')
        .where(selector)
        .select('message_id', 'name', 'body', 'active_at', 'created_at', 'updated_at');
};

const update = async (selector, updates) => {
    return await dbh('messages').where(selector).update(updates);
};

const create = async (inserts) => {
    return await dbh('messages').insert(inserts);
};

module.exports.get = get;
module.exports.update = update;
module.exports.create = create;
