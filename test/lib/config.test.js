// Configuration loader tests

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

    const validConfig = {
        app: {
            name: "Test App",
            port: 5000,
            address: "0.0.0.0",
        },
        session: {
            secret: {
                development: "dev-secret-key",
                production: "prod-secret-key",
            },
        },
        ratelimits: {
            enabled: 1,
            requests_threshold: 100,
            block_seconds: 60,
        },
        user_agent_blocks: {
            enabled: 0,
            user_agents: ["BadBot"],
        },
    };

    describe("successful loading", () => {
        it("should load and parse valid config file in development", () => {
            mockReadFileSync.mockReturnValue(JSON.stringify(validConfig));
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
            mockReadFileSync.mockReturnValue(JSON.stringify(validConfig));
            process.env.NODE_ENV = "production";

            const config = require("./../../lib/config");

            expect(config.app.name)
                .toBe("Test App");
        });

        it("should work with undefined NODE_ENV (defaults to production)", () => {
            delete process.env.NODE_ENV;
            mockReadFileSync.mockReturnValue(JSON.stringify(validConfig));

            const config = require("./../../lib/config");

            expect(config.app.name)
                .toBe("Test App");
        });
    });

    describe("app section validation", () => {
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
                .toThrow("config app section is required");
        });

        it("should throw when app.name is missing", () => {
            const mockConfig = {
                ...validConfig,
                app: { port: 5000, address: "0.0.0.0" },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app name section is required");
        });

        it("should throw when app.port is missing", () => {
            const mockConfig = {
                ...validConfig,
                app: { name: "Test", address: "0.0.0.0" },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app port section is required");
        });

        it("should throw when app.address is missing", () => {
            const mockConfig = {
                ...validConfig,
                app: { name: "Test", port: 5000 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config app address section is required");
        });
    });

    describe("session section validation", () => {
        it("should throw when session section is missing", () => {
            const mockConfig = {
                app: { name: "Test" },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config session section is required");
        });

        it("should throw when session.secret is missing", () => {
            const mockConfig = {
                app: { name: "Test", port: 5000, address: "0.0.0.0" },
                session: {},
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config session secret section is required");
        });
    });

    describe("session secret validation", () => {
        it("should throw when development secret is missing in development mode", () => {
            const mockConfig = {
                app: { name: "Test", port: 5000, address: "0.0.0.0" },
                session: {
                    secret: {
                        production: "prod-secret",
                    },
                },
                ratelimits: { enabled: 1, requests_threshold: 100, block_seconds: 60 },
                user_agent_blocks: { enabled: 0, user_agents: [] },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "development";

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config session secret development is required");
        });

        it("should throw when production secret is missing in production mode", () => {
            const mockConfig = {
                app: { name: "Test", port: 5000, address: "0.0.0.0" },
                session: {
                    secret: {
                        development: "dev-secret",
                    },
                },
                ratelimits: { enabled: 1, requests_threshold: 100, block_seconds: 60 },
                user_agent_blocks: { enabled: 0, user_agents: [] },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "production";

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config session secret production is required");
        });
    });

    describe("ratelimits section validation", () => {
        it("should throw when ratelimits section is missing", () => {
            const mockConfig = {
                app: { name: "Test", port: 5000, address: "0.0.0.0" },
                session: { secret: { development: "dev", production: "prod" } },
                user_agent_blocks: { enabled: 0, user_agents: [] },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config ratelimits section is required");
        });

        it("should throw when ratelimits.enabled is missing", () => {
            const mockConfig = {
                ...validConfig,
                ratelimits: { requests_threshold: 100, block_seconds: 60 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config ratelimits enabled is required");
        });

        it("should throw when ratelimits.enabled is invalid (not 0 or 1)", () => {
            const mockConfig = {
                ...validConfig,
                ratelimits: { enabled: 2, requests_threshold: 100, block_seconds: 60 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config ratelimits enabled must be either a true or false value");
        });

        it("should throw when ratelimits.requests_threshold is missing", () => {
            const mockConfig = {
                ...validConfig,
                ratelimits: { enabled: 1, block_seconds: 60 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config ratelimits requests_threshold is required");
        });

        it("should throw when ratelimits.requests_threshold is not a positive integer", () => {
            const mockConfig = {
                ...validConfig,
                ratelimits: { enabled: 1, requests_threshold: -1, block_seconds: 60 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config ratelimits requests_threshold config section is invalid");
        });

        it("should throw when ratelimits.block_seconds is missing", () => {
            const mockConfig = {
                ...validConfig,
                ratelimits: { enabled: 1, requests_threshold: 100 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config ratelimits block_seconds is required");
        });

        it("should throw when ratelimits.block_seconds is not a positive integer", () => {
            const mockConfig = {
                ...validConfig,
                ratelimits: { enabled: 1, requests_threshold: 100, block_seconds: 0 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config ratelimits block_seconds config section is invalid");
        });
    });

    describe("user_agent_blocks section validation", () => {
        it("should throw when user_agent_blocks section is missing", () => {
            const mockConfig = {
                app: { name: "Test", port: 5000, address: "0.0.0.0" },
                session: { secret: { development: "dev", production: "prod" } },
                ratelimits: { enabled: 1, requests_threshold: 100, block_seconds: 60 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config user_agent_blocks section is required");
        });

        it("should throw when user_agent_blocks.enabled is missing", () => {
            const mockConfig = {
                ...validConfig,
                user_agent_blocks: { user_agents: [] },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config user_agent_blocks enabled is required");
        });

        it("should throw when user_agent_blocks.enabled is invalid", () => {
            const mockConfig = {
                ...validConfig,
                user_agent_blocks: { enabled: 5, user_agents: [] },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config user_agent_blocks enabled must be either a true or false value");
        });

        it("should throw when user_agent_blocks.user_agents is missing", () => {
            const mockConfig = {
                ...validConfig,
                user_agent_blocks: { enabled: 1 },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config user_agent_blocks user_agents is required");
        });

        it("should throw when user_agent_blocks.user_agents is not an array", () => {
            const mockConfig = {
                ...validConfig,
                user_agent_blocks: { enabled: 1, user_agents: "not-array" },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));

            expect(() => {
                require("./../../lib/config");
            })
                .toThrow("config user_agent_blocks user_agents isn't an array");
        });
    });

    describe("config file reading", () => {
        it("should read from resolved path", () => {
            mockReadFileSync.mockReturnValue(JSON.stringify(validConfig));
            process.env.NODE_ENV = "development";

            require("./../../lib/config");

            expect(mockReadFileSync)
                .toHaveBeenCalledWith(
                    "/test/path/.hirgonrc",
                    "utf8",
                );
        });

        it("should parse JSON config correctly and preserve extra fields", () => {
            const mockConfig = {
                ...validConfig,
                extra: {
                    nested: {
                        value: "test",
                    },
                },
            };
            mockReadFileSync.mockReturnValue(JSON.stringify(mockConfig));
            process.env.NODE_ENV = "development";

            const config = require("./../../lib/config");

            expect(config.extra.nested.value)
                .toBe("test");
        });
    });
});
