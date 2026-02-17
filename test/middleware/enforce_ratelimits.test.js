// Enforce ratelimits middleware tests
// Integration-style with mocked node-cache (external package)

// Mock node-cache before importing the module
const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();

jest.mock("node-cache", () => {
    return jest.fn()
        .mockImplementation(() => ({
            get: mockCacheGet,
            set: mockCacheSet,
        }));
});

// Mock datetime to return consistent timestamp
jest.mock("./../../lib/datetime", () => ({
    current_timestamp: jest.fn()
        .mockReturnValue(1234567890),
}));

// Mock response to include HTTP_TOO_MANY_REQUESTS
jest.mock("./../../lib/response", () => ({
    status: {
        HTTP_BAD_REQUEST: { code: 400, string: "Bad Request" },
        HTTP_TOO_MANY_REQUESTS: { code: 429, string: "Too Many Requests" },
    },
}));

const enforce_ratelimits = require("./../../middleware/enforce_ratelimits");

describe("Enforce Ratelimits Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            headers: {},
            ip: "127.0.0.1",
        };
        res = {
            locals: {
                config: {
                    "ratelimits": {
                        "enabled": 1,
                        "requests_threshold": 10,
                        "block_seconds": 300,
                    },
                },
                api: false,
            },
            status: jest.fn()
                .mockReturnThis(),
            json: jest.fn(),
            render: jest.fn(),
        };
        next = jest.fn();
    });

    describe("when ratelimiting is disabled", () => {
        it("should call next immediately", () => {
            res.locals.config["ratelimits"]["enabled"] = 0;

            enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
            expect(mockCacheGet).not.toHaveBeenCalled();
        });
    });

    describe("IP address extraction", () => {
        beforeEach(() => {
            mockCacheGet.mockReturnValue(undefined);
            mockCacheSet.mockReturnValue(true);
        });

        it("should use x-forwarded-for header when valid", () => {
            req.headers["x-forwarded-for"] = "192.168.1.1";

            enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should extract last IP from x-forwarded-for list", () => {
            req.headers["x-forwarded-for"] = "10.0.0.1, 10.0.0.2, 192.168.1.1";

            enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should handle x-forwarded-for with whitespace", () => {
            req.headers["x-forwarded-for"] = "10.0.0.1,  192.168.1.1  ";

            enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should fall back to req.ip when x-forwarded-for is invalid", () => {
            req.headers["x-forwarded-for"] = "not-an-ip";

            enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should fall back to req.ip when x-forwarded-for is undefined", () => {
            enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should return 400 when IP is undefined", () => {
            req.ip = undefined;

            enforce_ratelimits(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(400);
            expect(res.render)
                .toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("should return JSON 400 for API when IP is undefined", () => {
            req.ip = undefined;
            res.locals.api = true;

            enforce_ratelimits(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(400);
            expect(res.json)
                .toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("rate limit checking", () => {
        beforeEach(() => {
            mockCacheGet.mockReturnValue(undefined);
            mockCacheSet.mockReturnValue(true);
        });

        it("should allow first request", () => {
            enforce_ratelimits(req, res, next);

            expect(mockCacheSet)
                .toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });

        it("should set cache key with initial count of 1", () => {
            enforce_ratelimits(req, res, next);

            expect(mockCacheSet)
                .toHaveBeenCalledWith(
                    expect.stringContaining("request_"),
                    1,
                    2,
                );
        });
    });

    describe("when IP is already rate limited", () => {
        it("should block request when ratelimit cache key exists", () => {
            mockCacheGet.mockImplementation((key) => {
                if (key.includes("ratelimit")) {
                    return 1234568190; // Future timestamp
                }
                return undefined;
            });

            enforce_ratelimits(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(429);
            expect(res.render)
                .toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("should return JSON for API when rate limited", () => {
            res.locals.api = true;
            mockCacheGet.mockImplementation((key) => {
                if (key.includes("ratelimit")) {
                    return 1234568190;
                }
                return undefined;
            });

            enforce_ratelimits(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(429);
            expect(res.json)
                .toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("cache errors", () => {
        it("should throw error when initial cache set fails", () => {
            mockCacheGet.mockReturnValue(undefined);
            mockCacheSet.mockReturnValue(undefined);

            expect(() => {
                enforce_ratelimits(req, res, next);
            })
                .toThrow(/cache key failed to set/);
        });
    });
});
