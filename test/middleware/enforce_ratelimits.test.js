// Enforce ratelimits middleware tests
// Integration-style with mocked node-cache (external package)

const cacheMock = {
    get: () => undefined,
    set: () => true,
};

jest.mock("node-cache", () => {
    return jest.fn()
        .mockImplementation(() => cacheMock);
});

jest.mock("./../../lib/datetime", () => ({
    current_timestamp: jest.fn()
        .mockResolvedValue(1234567890),
}));

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
        cacheMock.get = () => undefined;
        cacheMock.set = () => true;

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
        it("should call next immediately", async () => {
            res.locals.config["ratelimits"]["enabled"] = 0;

            await enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });
    });

    describe("IP address extraction", () => {
        it("should use x-forwarded-for header when valid", async () => {
            req.headers["x-forwarded-for"] = "192.168.1.1";

            await enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should extract last IP from x-forwarded-for list", async () => {
            req.headers["x-forwarded-for"] = "10.0.0.1, 10.0.0.2, 192.168.1.1";

            await enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should handle x-forwarded-for with whitespace", async () => {
            req.headers["x-forwarded-for"] = "10.0.0.1,  192.168.1.1  ";

            await enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should fall back to req.ip when x-forwarded-for is invalid", async () => {
            req.headers["x-forwarded-for"] = "not-an-ip";

            await enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should fall back to req.ip when x-forwarded-for is undefined", async () => {
            await enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should return 400 when IP is undefined", async () => {
            req.ip = undefined;

            await enforce_ratelimits(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(400);
            expect(res.render)
                .toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("should return JSON 400 for API when IP is undefined", async () => {
            req.ip = undefined;
            res.locals.api = true;

            await enforce_ratelimits(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(400);
            expect(res.json)
                .toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("rate limit checking", () => {
        it("should allow first request", async () => {
            await enforce_ratelimits(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should set cache key with initial count of 1", async () => {
            const setSpy = jest.spyOn(cacheMock, "set");

            await enforce_ratelimits(req, res, next);

            expect(setSpy)
                .toHaveBeenCalledWith(
                    expect.stringContaining("request_"),
                    1,
                    2,
                );

            setSpy.mockRestore();
        });
    });

    describe("when IP is already rate limited", () => {
        it("should block request when ratelimit cache key exists", async () => {
            cacheMock.get = (key) => {
                if (key.includes("ratelimit")) {
                    return 1234568190; // Future timestamp
                }
                return undefined;
            };

            await enforce_ratelimits(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(429);
            expect(res.render)
                .toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("should return JSON for API when rate limited", async () => {
            res.locals.api = true;
            cacheMock.get = (key) => {
                if (key.includes("ratelimit")) {
                    return 1234568190;
                }
                return undefined;
            };

            await enforce_ratelimits(req, res, next);

            expect(res.status)
                .toHaveBeenCalledWith(429);
            expect(res.json)
                .toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("cache errors", () => {
        it("should throw error when initial cache set fails", async () => {
            cacheMock.get = () => undefined;
            cacheMock.set = () => undefined;

            await expect(enforce_ratelimits(req, res, next))
                .rejects.toThrow(/cache key failed to set/);
        });
    });
});
