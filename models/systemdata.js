// systemdata db methods

const dbh = require('./../lib/dbh');

const get = async (selector) => {
    return await dbh('systemdata')
        .where(selector)
        .select('key', 'value', 'data', 'created_at', 'updated_at');
};

const update = async (selector, updates) => {
    return await dbh('systemdata').where(selector).update(updates);
};

const create = async (inserts) => {
    return await dbh('systemdata').insert(inserts);
};

const remove = async (selector) => {
    return await dbh('systemdata')
        .where(selector)
        .del();
};

const get_format_systemdata = async (req) => {
    const res = await get({});
    let systemdata = {};
    for (row of res) {
        const key = row['key'];
        delete row['key'];
        systemdata[key] = row;
    }
    return systemdata;
};

module.exports.get = get;
module.exports.update = update;
module.exports.create = create;
module.exports.remove = remove;
module.exports.get_format_systemdata = get_format_systemdata;
