module.exports = {
    testEnvironment: "node",
    roots: ["<rootDir>/test"],
    testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
    collectCoverageFrom: [
        "models/**/*.js",
        "routes/**/*.js",
        "lib/**/*.js",
        "!**/node_modules/**",
        "!**/test/**",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    transformIgnorePatterns: ["node_modules/(?!supertest)"],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
};