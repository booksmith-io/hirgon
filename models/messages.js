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
                    'scheduled_at',
                    'created_at',
                    'updated_at',
                ],
            )
            // show active at the top
            // then scheduled by when they'll be active
            // then most recent updated
            .orderByRaw(`
                active_at ASC NULLS LAST,
                scheduled_at ASC NULLS LAST,
                updated_at DESC NULLS LAST
            `);
    };

    async remove (selector) {
        return await this.dbh('messages')
            .where(selector)
            .del();
    };
}

module.exports.Messages = Messages;
