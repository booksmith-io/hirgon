const session_util = require("./../../lib/session_util");

describe("Session Utils", () => {
    describe("empty_session", () => {
        it("should remove all session data except cookie", () => {
            const mockReq = {
                session: {
                    authenticated: true,
                    user: { id: 1 },
                    alert: { type: "info" },
                    cookie: "session-cookie-data",
                },
            };

            session_util.empty_session(mockReq);

            expect(mockReq.session)
                .toEqual({
                    cookie: "session-cookie-data",
                });
        });

        it("should handle empty session", () => {
            const mockReq = {
                session: {},
            };

            session_util.empty_session(mockReq);

            expect(mockReq.session)
                .toEqual({});
        });

        it("should handle session with only cookie", () => {
            const mockReq = {
                session: {
                    cookie: "session-cookie-data",
                },
            };

            session_util.empty_session(mockReq);

            expect(mockReq.session)
                .toEqual({
                    cookie: "session-cookie-data",
                });
        });
    });

    describe("get_alert", () => {
        it("should return and remove alert from session", () => {
            const mockReq = {
                session: {
                    alert: { type: "info", message: "Test alert" },
                    user: { id: 1 },
                },
            };

            const result = session_util.get_alert(mockReq);

            expect(result)
                .toEqual({ type: "info", message: "Test alert" });
            expect(mockReq.session.alert)
                .toBeUndefined();
            expect(mockReq.session.user)
                .toEqual({ id: 1 });
        });

        it("should return undefined when no alert exists", () => {
            const mockReq = {
                session: {
                    user: { id: 1 },
                },
            };

            const result = session_util.get_alert(mockReq);

            expect(result)
                .toBeUndefined();
            expect(mockReq.session.user)
                .toEqual({ id: 1 });
        });

        it("should handle no session", () => {
            const mockReq = {};

            const result = session_util.get_alert(mockReq);

            expect(result)
                .toBeUndefined();
        });
    });

    describe("set_alert", () => {
        it("should set alert in session", () => {
            const mockReq = {
                session: {
                    user: { id: 1 },
                },
            };

            const alertData = { type: "error", message: "Error message" };

            session_util.set_alert(mockReq, alertData);

            expect(mockReq.session.alert)
                .toEqual(alertData);
            expect(mockReq.session.user)
                .toEqual({ id: 1 });
        });

        it("should override existing alert", () => {
            const mockReq = {
                session: {
                    alert: { type: "info", message: "Old alert" },
                },
            };

            const newAlertData = { type: "success", message: "New alert" };

            session_util.set_alert(mockReq, newAlertData);

            expect(mockReq.session.alert)
                .toEqual(newAlertData);
        });
    });

    describe("build_config", () => {
        let mockSession, mockConfig, originalEnv;

        beforeEach(() => {
            // Mock better-sqlite3 and its session store
            jest.mock("better-sqlite3", () => {
                return jest.fn()
                    .mockImplementation(() => ({}));
            });

            jest.mock("better-sqlite3-session-store", () => {
                return jest.fn()
                    .mockImplementation(() => {
                        return function (options) {
                            return {};
                        };
                    });
            });

            mockSession = {
                store: {},
                secret: "",
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: false,
                    maxAge: 259200000,
                },
            };

            mockConfig = {
                session: {
                    secret: {
                        development: "dev-secret",
                        production: "prod-secret",
                    },
                },
            };

            originalEnv = process.env.NODE_ENV;
        });

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it("should build config for development environment", () => {
            process.env.NODE_ENV = "development";

            const result = session_util.build_config(mockSession, mockConfig);

            expect(result.secret)
                .toBe("dev-secret");
            expect(result.cookie.secure)
                .toBe(false);
            expect(result.resave)
                .toBe(false);
            expect(result.saveUninitialized)
                .toBe(false);
            expect(result.cookie.maxAge)
                .toBe(259200000);
        });

        it("should build config for production environment", () => {
            process.env.NODE_ENV = "production";

            const result = session_util.build_config(mockSession, mockConfig);

            expect(result.secret)
                .toBe("prod-secret");
            expect(result.cookie.secure)
                .toBe(true);
            expect(result.resave)
                .toBe(false);
            expect(result.saveUninitialized)
                .toBe(false);
        });

        it("should default to production when NODE_ENV is not set", () => {
            delete process.env.NODE_ENV;

            const result = session_util.build_config(mockSession, mockConfig);

            expect(result.secret)
                .toBe("prod-secret");
            expect(result.cookie.secure)
                .toBe(true);
            expect(process.env.NODE_ENV)
                .toBe("production");
        });
    });
});