// Fix trailing slashes middleware tests
// Integration-style testing - no mocking needed

const fix_trailing_slashes = require("./../../middleware/fix_trailing_slashes");

describe("Fix Trailing Slashes Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { url: "" };
        res = {
            redirect: jest.fn(),
        };
        next = jest.fn();
    });

    describe("URLs that should be redirected", () => {
        it("should redirect URLs ending with slash", () => {
            req.url = "/test/";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect)
                .toHaveBeenCalledWith(301, "/test");
            expect(next).not.toHaveBeenCalled();
        });

        it("should redirect nested paths ending with slash", () => {
            req.url = "/api/v1/users/";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect)
                .toHaveBeenCalledWith(301, "/api/v1/users");
        });

        it("should redirect long paths", () => {
            req.url = "/very/long/path/to/resource/";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect)
                .toHaveBeenCalledWith(301, "/very/long/path/to/resource");
        });
    });

    describe("URLs that should NOT be redirected", () => {
        it("should call next for root path", () => {
            req.url = "/";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });

        it("should call next for URLs without trailing slash", () => {
            req.url = "/test";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });

        it("should not redirect when slash is in query string only", () => {
            req.url = "/test?param=value/";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });

        it("should not redirect when slash is in the middle of query string", () => {
            req.url = "/test?path=/other/stuff";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });

        it("should not redirect multiple slashes in query string", () => {
            req.url = "/test?a=/b/c/&d=/e";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });
    });

    describe("Edge cases", () => {
        it("should not redirect URLs with query strings (no trailing slash)", () => {
            req.url = "/test?foo=bar";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });

        it("should handle URLs with query strings containing slashes", () => {
            req.url = "/test?path=/foo/bar";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next)
                .toHaveBeenCalled();
        });

        it("should handle URLs with multiple path segments", () => {
            req.url = "/a/b/c/d/";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect)
                .toHaveBeenCalledWith(301, "/a/b/c/d");
        });

        it("should handle single character paths with slash", () => {
            req.url = "/x/";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect)
                .toHaveBeenCalledWith(301, "/x");
        });

        it("should handle paths with hyphens and numbers", () => {
            req.url = "/api-v2/resource-123/";

            fix_trailing_slashes(req, res, next);

            expect(res.redirect)
                .toHaveBeenCalledWith(301, "/api-v2/resource-123");
        });
    });
});
