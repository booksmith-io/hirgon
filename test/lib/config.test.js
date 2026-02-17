// Configuration loader tests
// Integration-style with mocked fs (external system interaction)

const mockReadFileSync = jest.fn();

jest.mock("fs", () => ({
    readFileSync: mockReadFileSync,
}));

jest.mock("path", () => ({
    resolve: jest.fn()
        .mockReturnValue("/test/path/.hirgonrc"),
}));

describe("Config Module", () => {
    let originalEnv;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    describe("successful loading", () => {
        it("should load and parse valid config file", () => {
            const mockConfig = {
                app: { name: "Test App", port: 5000 },
                session: {
                    secret: {
                        development: "dev-secret-key",
                        production: "prod-secret-key",
                    },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "development";

            const config = require("./../../lib/config");

            expect(mockReadFileSync)
                .toHaveBeenCalledWith(
                    "/test/path/.hirgonrc",
                    "utf8",
                );
            expect(config.app.name)
                .toBe("Test App");
            expect(config.app.port)
                .toBe(5000);
        });

        it("should work with production environment", () => {
            const mockConfig = {
                app: { name: "Prod App" },
                session: {
                    secret: {
                        development: "dev-secret",
                        production: "prod-secret",
                    },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "production";

            const config = require("./../../lib/config");

            expect(config.app.name)
                .toBe("Prod App");
        });
    });

    describe("validation errors", () => {
        it("should throw when app section is missing", () => {
            const mockConfig = {
                session: {
                    secret: { development: "secret" },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app and config session sections are required");
        });

        it("should throw when session section is missing", () => {
            const mockConfig = {
                app: { name: "Test" },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app and config session sections are required");
        });

        it("should throw when both app and session are missing", () => {
            const mockConfig = {};
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app and config session sections are required");
        });
    });

    describe("session secret validation", () => {
        it("should throw when session.secret is missing", () => {
            const mockConfig = {
                app: { name: "Test" },
                session: {},
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app.session.secret is required");
        });

        it("should throw when development secret is missing in development mode", () => {
            const mockConfig = {
                app: { name: "Test" },
                session: {
                    secret: {
                        production: "prod-secret",
                    },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "development";

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app.session.secret.development is required");
        });

        it("should throw when production secret is missing in production mode", () => {
            const mockConfig = {
                app: { name: "Test" },
                session: {
                    secret: {
                        development: "dev-secret",
                    },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "production";

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app.session.secret.production is required");
        });

        it("should accept config with both secrets defined", () => {
            const mockConfig = {
                app: { name: "Test" },
                session: {
                    secret: {
                        development: "dev-secret",
                        production: "prod-secret",
                    },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "production";

            expect(() => {
                require("./../../lib/config");
            }).not.toThrow();
        });
    });

    describe("config file reading", () => {
        it("should read from resolved path", () => {
            const mockConfig = {
                app: { name: "Test" },
                session: {
                    secret: { development: "secret" },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "development";

            require("./../../lib/config");

            expect(mockReadFileSync)
                .toHaveBeenCalledWith(
                    "/test/path/.hirgonrc",
                    "utf8",
                );
        });

        it("should parse JSON config correctly", () => {
            const mockConfig = {
                app: {
                    name: "Complex App",
                    url: "http://localhost:5000",
                    address: "0.0.0.0",
                    port: 5000,
                },
                session: {
                    secret: {
                        development: "dev-secret",
                        production: "prod-secret",
                    },
                },
                extra: {
                    nested: {
                        value: "test",
                    },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "development";

            const config = require("./../../lib/config");

            expect(config.app.url)
                .toBe("http://localhost:5000");
            expect(config.app.address)
                .toBe("0.0.0.0");
            expect(config.extra.nested.value)
                .toBe("test");
        });
    });
});
