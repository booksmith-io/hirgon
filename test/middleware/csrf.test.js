// CSRF middleware tests
// Testing with minimal mocking - only external csurf package

const csrf = require("./../../middleware/csrf");

describe("CSRF Middleware", () => {
    describe("get_csrf_token", () => {
        it("should set csrf_token in res.locals from req.csrfToken()", () => {
            const req = {
                csrfToken: jest.fn()
                    .mockReturnValue("test-csrf-token-123"),
            };
            const res = {
                locals: {},
            };
            const next = jest.fn();

            csrf.get_csrf_token(req, res, next);

            expect(res.locals.csrf_token)
                .toBe("test-csrf-token-123");
            expect(req.csrfToken)
                .toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });

        it("should handle different token values", () => {
            const req = {
                csrfToken: jest.fn()
                    .mockReturnValue("another-token-xyz"),
            };
            const res = {
                locals: {},
            };
            const next = jest.fn();

            csrf.get_csrf_token(req, res, next);

            expect(res.locals.csrf_token)
                .toBe("another-token-xyz");
            expect(next)
                .toHaveBeenCalled();
        });
    });

    describe("csrf_protection", () => {
        it("should be a function exported from the module", () => {
            expect(typeof csrf.csrf_protection)
                .toBe("function");
        });

        it("should have length 3 (req, res, next)", () => {
            expect(csrf.csrf_protection.length)
                .toBe(3);
        });
    });
});
