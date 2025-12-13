// base model for models

class Base {
    constructor() {
        this.dbh = require('./../lib/dbh');
        this._table = this.constructor.name.toLowerCase();
    }

    // the table names for the method below rely on the model
    // Class names corresponding to the names of the tables
    // they interact with.  eg...
    // Class :: table
    // Users :: users
    // Messages :: messages
    // Systemdata :: systemdata

    // the get method in the child classes redefine and
    // call super, passing in the columns they need.
    // that way the methods here in the base class can
    // stay agnostic.
    async get (columns, selector) {
        return await this.dbh(this._table)
            .where(selector)
            .select(columns);
    };

    async update (selector, updates) {
        return await this.dbh(this._table)
            .where(selector)
            .update(updates);
    };

    async create (inserts) {
        return await this.dbh(this._table)
            .insert(inserts);
    };

    // we're intentionally not adding a remove (delete) method to all models.
    // some models we don't want to delete from, specifically users.
}

module.exports.Base = Base;
