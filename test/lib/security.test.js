// Security middleware tests
// Integration-style with mocked helmet (external package)

const mockHelmetMiddleware = jest.fn((req, res, next) => next());

jest.mock("helmet", () => {
    return jest.fn(() => mockHelmetMiddleware);
});

const security = require("./../../lib/security");

describe("Security Middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("headers middleware", () => {
        it("should be a function", () => {
            expect(typeof security.headers)
                .toBe("function");
        });

        it("should call next when invoked", () => {
            const req = {};
            const res = {};
            const next = jest.fn();

            security.headers(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should have correct arity (3 arguments)", () => {
            expect(security.headers.length)
                .toBe(3);
        });

        it("should be the helmet middleware", () => {
            expect(security.headers)
                .toBe(mockHelmetMiddleware);
        });

        it("should pass through all arguments to helmet", () => {
            const req = { test: "request" };
            const res = { test: "response" };
            const next = jest.fn();

            security.headers(req, res, next);

            expect(mockHelmetMiddleware)
                .toHaveBeenCalledWith(req, res, next);
        });
    });

    describe("helmet configuration", () => {
        it("should initialize helmet with configuration", () => {
            // Re-require to trigger the helmet() call
            jest.resetModules();
            const helmet = require("helmet");
            require("./../../lib/security");

            expect(helmet)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        contentSecurityPolicy: expect.objectContaining({
                            directives: expect.any(Object),
                        }),
                        hsts: expect.objectContaining({
                            maxAge: 31536000,
                            includeSubDomains: true,
                            preload: true,
                        }),
                        noSniff: true,
                        frameguard: expect.objectContaining({ action: "deny" }),
                        xssFilter: true,
                        referrerPolicy: expect.objectContaining({
                            policy: "strict-origin-when-cross-origin",
                        }),
                    }),
                );
        });
    });
});
