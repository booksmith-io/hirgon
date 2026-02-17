const icons = require("./../../lib/icons");

describe("Icons Utils", () => {
    describe("icons array", () => {
        it("should export icons array", () => {
            expect(icons.icons)
                .toBeDefined();
            expect(Array.isArray(icons.icons))
                .toBe(true);
        });

        it("should contain icon names", () => {
            if (icons.icons.length > 0) {
                icons.icons.forEach((icon) => {
                    expect(typeof icon)
                        .toBe("string");
                    expect(icon.length)
                        .toBeGreaterThan(0);
                });
            }
        });

        it("should have only unique icon names", () => {
            const uniqueIcons = [...new Set(icons.icons)];
            expect(icons.icons.length)
                .toBe(uniqueIcons.length);
        });
    });
});