const request = require("supertest");
const bcrypt = require("bcryptjs");
const { create_test_app } = require("../helpers/express");

// Mock the dependencies
jest.mock("./../../models/users");
jest.mock("./../../lib/session_util");
jest.mock("./../../lib/response", () => ({
    status: {
        HTTP_UNAUTHORIZED: { code: 401 },
        HTTP_FORBIDDEN: { code: 403, string: "Forbidden" },
    },
}));

const { Users } = require("./../../models/users");
const session_util = require("./../../lib/session_util");
const loginRouter = require("./../../routes/login");

describe("Login Route Handler", () => {
    let app;
    let mockUsers;

    beforeEach(() => {
        jest.clearAllMocks();

        app = create_test_app();
        app.use("/login", loginRouter);

        mockUsers = {
            get: jest.fn(),
        };
        Users.mockImplementation(() => mockUsers);

        // Mock session_util
        session_util.get_alert = jest.fn()
            .mockReturnValue(null);
        session_util.empty_session = jest.fn();
        session_util.set_alert = jest.fn();
    });

    describe("GET /login", () => {
        it("should render login page if not authenticated", async () => {
            const response = await request(app)
                .get("/login");

            expect(response.status)
                .toBe(200);
            expect(response.text)
                .toBe("Login page rendered successfully");
        });

        it("should render login page if not authenticated", async () => {
            const response = await request(app)
                .get("/login");

            expect(response.status)
                .toBe(200);
            expect(response.text)
                .toBe("Login page rendered successfully");
        });

        it("should redirect to home if already authenticated", async () => {
            // Create fresh app with session middleware
            const express = require("express");
            const testApp = express();
            testApp.use(express.urlencoded({ extended: true }));
            testApp.use((req, res, next) => {
                req.session = { authenticated: true, user: { user_id: 1 } };
                req.session.regenerate = jest.fn((cb) => cb());
                next();
            });
            testApp.use((req, res, next) => {
                res.locals = { systemdata: { "settings:icon": { value: "test" } } };
                next();
            });
            testApp.use((req, res, next) => {
                res.render = function (view, locals) {
                    if (view === "login") {
                        res.status(200)
                            .send("Login page");
                    } else {
                        res.status(200)
                            .send("Other page");
                    }
                };
                next();
            });
            testApp.use("/login", loginRouter);

            const response = await request(testApp)
                .get("/login");

            expect(response.status)
                .toBe(302);
            expect(response.headers.location)
                .toBe("/");
        });

        it("should handle session regeneration errors gracefully", async () => {
            const consoleSpy = jest.spyOn(console, "error")
                .mockImplementation();

            const express = require("express");
            const testApp = express();
            testApp.use(express.urlencoded({ extended: true }));
            testApp.use((req, res, next) => {
                req.session = { authenticated: true, user: { user_id: 1 } };
                req.session.regenerate = jest.fn((cb) => cb(new Error("Regeneration failed")));
                next();
            });
            testApp.use((req, res, next) => {
                res.locals = { systemdata: { "settings:icon": { value: "test" } } };
                next();
            });
            testApp.use((req, res, next) => {
                res.render = function (view, locals) {
                    res.status(200)
                        .send("Page");
                };
                next();
            });
            testApp.use("/login", loginRouter);

            const response = await request(testApp)
                .get("/login");

            expect(response.status)
                .toBe(302);
            expect(consoleSpy)
                .toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe("CSRF error handling", () => {
        it("should handle EBADCSRFTOKEN error", async () => {
            const response = await request(app)
                .post("/login")
                .set("X-Test-CSRF-Error", "EBADCSRFTOKEN");

            // The CSRF middleware in the route should handle this
            expect(response.status)
                .toBe(401);
        });
    });

    describe("POST /login", () => {
        it("should return error for missing credentials", async () => {
            const response = await request(app)
                .post("/login")
                .send({});

            expect(response.status)
                .toBe(401);
            expect(response.text)
                .toContain("Login page with error rendered");
        });

        it("should return error for non-existent user", async () => {
            mockUsers.get.mockResolvedValue([]);

            const response = await request(app)
                .post("/login")
                .send({ email: "nonexistent@example.com", password: "password123" });

            expect(mockUsers.get)
                .toHaveBeenCalledWith({ email: "nonexistent@example.com" });
            expect(response.status)
                .toBe(401);
            expect(response.text)
                .toContain("Login page with error rendered");
        });

        it("should return error for incorrect password", async () => {
            const mockUser = {
                user_id: 1,
                name: "Test User",
                email: "test@example.com",
                passwd: bcrypt.hashSync("correctpassword", 10),
                active: 1,
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00",
            };

            mockUsers.get.mockResolvedValue([mockUser]);

            const response = await request(app)
                .post("/login")
                .send({ email: "test@example.com", password: "wrongpassword" });

            expect(mockUsers.get)
                .toHaveBeenCalledWith({ email: "test@example.com" });
            expect(response.status)
                .toBe(401);
            expect(response.text)
                .toContain("Login page with error rendered");
        });

        it("should return error for correct credentials but with server error", async () => {
            const mockUser = {
                user_id: 1,
                name: "Test User",
                email: "test@example.com",
                passwd: bcrypt.hashSync("correctpassword123", 10),
                active: 1,
                created_at: "2025-01-01 00:00:00",
                updated_at: "2025-01-01 00:00:00",
            };

            mockUsers.get.mockResolvedValue([mockUser]);

            const response = await request(app)
                .post("/login")
                .send({ email: "test@example.com", password: "correctpassword123" });

            expect(mockUsers.get)
                .toHaveBeenCalledWith({ email: "test@example.com" });
            expect(response.status)
                .toBe(500);
        });

        it("should return error when user returns empty array", async () => {
            mockUsers.get.mockResolvedValue([]);

            const response = await request(app)
                .post("/login")
                .send({ email: "nonexistent@example.com", password: "anypassword" });

            expect(response.status)
                .toBe(401);
            expect(session_util.empty_session)
                .toHaveBeenCalled();
        });

        it("should return error when user returns undefined", async () => {
            mockUsers.get.mockResolvedValue(undefined);

            const response = await request(app)
                .post("/login")
                .send({ email: "test@example.com", password: "password123" });

            // When user is undefined, accessing user[0] causes an error, resulting in 500
            expect(response.status)
                .toBe(500);
        });

        it("should return error with only email provided", async () => {
            const response = await request(app)
                .post("/login")
                .send({ email: "test@example.com" });

            expect(response.status)
                .toBe(401);
        });

        it("should return error with only password provided", async () => {
            const response = await request(app)
                .post("/login")
                .send({ password: "password123" });

            expect(response.status)
                .toBe(401);
        });

        it("should return error with empty email string", async () => {
            const response = await request(app)
                .post("/login")
                .send({ email: "", password: "password123" });

            expect(response.status)
                .toBe(401);
        });

        it("should return error with empty password string", async () => {
            const response = await request(app)
                .post("/login")
                .send({ email: "test@example.com", password: "" });

            expect(response.status)
                .toBe(401);
        });

        it("should handle missing req.body", async () => {
            const response = await request(app)
                .post("/login")
                .send();

            expect(response.status)
                .toBe(401);
        });
    });
});
