// messages db methods

const dbh = require('./../lib/dbh');

const get = async (selector) => {
    return await dbh('messages')
        .where(selector)
        .select('message_id', 'name', 'body', 'active', 'active_at', 'created_at', 'updated_at')
        .orderBy('active_at', 'desc')
        .orderBy('updated_at', 'desc')
};

const update = async (selector, updates) => {
    return await dbh('messages').where(selector).update(updates);
};

const create = async (inserts) => {
    return await dbh('messages').insert(inserts);
};

const remove = async (selector) => {
    return await dbh('messages')
        .where(selector)
        .del();
};

module.exports.get = get;
module.exports.update = update;
module.exports.create = create;
module.exports.remove = remove;
