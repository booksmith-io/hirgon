/* functions to do datetime things
   yes, it does everything in the database.
   yes, that's on purpose.
*/

const dbh = require('./../lib/dbh');

const localtime = async () => {
    const ret = await dbh
        .raw("select datetime('now', 'localtime')");

     return Object.values(ret[0])[0];
};

module.exports.localtime = localtime;
