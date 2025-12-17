/* functions to do datetime things
   yes, it does everything in the database.
   yes, that's on purpose.
*/

const dbh = require('./../lib/dbh');

const datetime_regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

const localtime = async () => {
    const ret = await dbh
        .raw(`select datetime('now', 'localtime')`);

    return Object.values(ret[0])[0];
};

const datetime_is_future = async (datetime) => {
    if (!datetime) {
        throw new Error('datetime is required');
    }

    if (!datetime_regex.test(datetime)) {
        throw new Error(`${datetime} is not a valid datetime string`);
    }

    const ret = await dbh
        .raw(`
            SELECT CASE
                WHEN
                    strftime('%s', '${datetime}') - strftime('%s', datetime('now', 'localtime')) <= 0
                THEN
                    0
                ELSE
                    1
            END is_future
        `);

    return Object.values(ret[0])[0];
};

module.exports.localtime = localtime;
module.exports.datetime_is_future = datetime_is_future;
