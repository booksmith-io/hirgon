// systemdata model

const base = require('./base');

class Systemdata extends base.Base {
    constructor() {
        super();
    }

    async get (selector) {
        return await super.get(
            [
                'key',
                'value',
                'data',
                'created_at',
                'updated_at',
            ],
            selector,
        );
    };

    async remove (selector) {
        return await this.dbh('systemdata')
            .where(selector)
            .del();
    };

    async get_format_systemdata () {
        const res = await super.get('*', {});
        let systemdata = {};
        for (let row of res) {
            const key = row['key'];
            delete row['key'];
            systemdata[key] = row;
        }
        return systemdata;
    };
}

module.exports.Systemdata = Systemdata;
