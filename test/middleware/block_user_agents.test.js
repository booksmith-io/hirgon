// Block user agents middleware tests
// Integration-style testing with minimal mocking

const block_user_agents = require("./../../middleware/block_user_agents");

describe("Block User Agents Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            get: jest.fn(),
        };
        res = {
            locals: {
                config: {
                    "user_agent_blocks": {
                        "enabled": 1,
                        "user_agents": [],
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

    describe("when blocking is disabled", () => {
        it("should call next and not block", () => {
            res.locals.config["user_agent_blocks"]["enabled"] = 0;

            block_user_agents(req, res, next);

            expect(next)
                .toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    describe("when blocking is enabled", () => {
        beforeEach(() => {
            res.locals.config["user_agent_blocks"]["enabled"] = 1;
        });

        it("should call next for allowed user agents", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = ["BadBot"];
            req.get.mockReturnValue("Mozilla/5.0 (compatible; GoodBot/1.0)");

            block_user_agents(req, res, next);

            expect(next)
                .toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it("should block matching user agents", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = ["BadBot"];
            req.get.mockReturnValue("BadBot/1.0 (crawler)");

            block_user_agents(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status)
                .toHaveBeenCalledWith(406);
            expect(res.render)
                .toHaveBeenCalledWith(
                    "406",
                    expect.objectContaining({
                        layout: false,
                        message: expect.any(String),
                    }),
                );
        });

        it("should block case-insensitively", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = ["badbot"];
            req.get.mockReturnValue("BadBot/1.0");

            block_user_agents(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status)
                .toHaveBeenCalledWith(406);
        });

        it("should block user agents with special regex characters", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = ["bot[1.0]"];
            req.get.mockReturnValue("bot[1.0]/crawler");

            block_user_agents(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status)
                .toHaveBeenCalledWith(406);
        });

        it("should return JSON response for API requests", () => {
            res.locals.api = true;
            res.locals.config["user_agent_blocks"]["user_agents"] = ["BadBot"];
            req.get.mockReturnValue("BadBot/1.0");

            block_user_agents(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status)
                .toHaveBeenCalledWith(406);
            expect(res.json)
                .toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: expect.any(String),
                    }),
                );
            expect(res.render).not.toHaveBeenCalled();
        });

        it("should check all user agents in the list", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = [
                "BotOne",
                "BotTwo",
                "BadBot",
            ];
            req.get.mockReturnValue("Mozilla/5.0 GoodBrowser");

            block_user_agents(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should block when any user agent matches", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = [
                "BotOne",
                "BadBot",
                "BotThree",
            ];
            req.get.mockReturnValue("BadBot/2.0");

            block_user_agents(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status)
                .toHaveBeenCalledWith(406);
        });

        it("should handle empty user agent", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = ["BadBot"];
            req.get.mockReturnValue("");

            block_user_agents(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should handle undefined user agent", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = ["BadBot"];
            req.get.mockReturnValue(undefined);

            block_user_agents(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });

        it("should handle empty blocked user agents list", () => {
            res.locals.config["user_agent_blocks"]["user_agents"] = [];
            req.get.mockReturnValue("AnyBot/1.0");

            block_user_agents(req, res, next);

            expect(next)
                .toHaveBeenCalled();
        });
    });
});
