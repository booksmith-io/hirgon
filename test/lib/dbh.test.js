// Database connection helper tests
// Integration-style with mocked knex (external package)

const mockKnexInstance = jest.fn();

jest.mock("knex", () => {
    return jest.fn(() => mockKnexInstance);
});

const path = require("path");

describe("DBH Module", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should configure knex with sqlite3 client", () => {
        require("./../../lib/dbh");

        expect(require("knex"))
            .toHaveBeenCalledWith(
                expect.objectContaining({
                    client: "sqlite3",
                    useNullAsDefault: true,
                }),
            );
    });

    it("should set correct database file path", () => {
        require("./../../lib/dbh");

        const knexCall = require("knex").mock.calls[0][0];
        expect(knexCall.connection)
            .toHaveProperty("filename");
        expect(knexCall.connection.filename)
            .toContain("hirgon.sqlite3");
        expect(knexCall.connection.filename)
            .toContain("db");
    });

    it("should use absolute path for database file", () => {
        require("./../../lib/dbh");

        const knexCall = require("knex").mock.calls[0][0];
        const dbPath = knexCall.connection.filename;

        // Should be absolute path (starts with / on Unix or drive letter on Windows)
        expect(path.isAbsolute(dbPath))
            .toBe(true);
    });

    it("should export the knex instance", () => {
        const dbh = require("./../../lib/dbh");

        expect(dbh)
            .toBe(mockKnexInstance);
    });

    it("should configure with useNullAsDefault enabled", () => {
        require("./../../lib/dbh");

        const knexCall = require("knex").mock.calls[0][0];
        expect(knexCall.useNullAsDefault)
            .toBe(true);
    });
});
