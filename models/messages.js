// messages model

const base = require('./base');

class Messages extends base.Base {
    constructor() {
        super();
    }

    // rather than calling super.get like we do in the users model
    // we're just calling super.dbh so we can also run orderBy.
    async get (selector) {
        return await this.dbh('messages')
            .where(selector)
            .select(
                [
                    'message_id',
                    'name',
                    'body',
                    'active',
                    'active_at',
                    'created_at',
                    'updated_at',
                ],
            )
            .orderBy('active_at', 'desc')
            .orderBy('updated_at', 'desc');
    };

    async remove (selector) {
        return await this.dbh('messages')
            .where(selector)
            .del();
    };
}

module.exports.Messages = Messages;
