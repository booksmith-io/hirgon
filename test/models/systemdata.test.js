const { Systemdata } = require("./../../models/systemdata");

describe("Systemdata Model", () => {
    let systemdata;

    beforeEach(() => {
        jest.clearAllMocks();
        systemdata = new Systemdata();
    });

    describe("constructor", () => {
        it("should initialize with table name \"systemdata\"", () => {
            expect(systemdata._table)
                .toBe("systemdata");
        });
    });

    describe("get method", () => {
        it("should call super.get with correct columns and selector", async () => {
            const selector = { key: "test-key" };
            const expectedResult = [
                {
                    key: "test-key",
                    value: "test-value",
                    data: "{\"extra\": \"data\"}",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
            ];

            // Mock the dbh method directly on the instance
            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                select: jest.fn()
                    .mockResolvedValue(expectedResult),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.get(selector);

            expect(mockDb.where)
                .toHaveBeenCalledWith(selector);
            expect(mockDb.select)
                .toHaveBeenCalledWith([
                    "key",
                    "value",
                    "data",
                    "created_at",
                    "updated_at",
                ]);
            expect(result)
                .toEqual(expectedResult);
        });
    });

    describe("remove method", () => {
        it("should call database delete with correct parameters", async () => {
            const selector = { key: "test-key" };
            const expectedResult = 1;

            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                del: jest.fn()
                    .mockResolvedValue(expectedResult),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.remove(selector);

            expect(mockDb.where)
                .toHaveBeenCalledWith(selector);
            expect(mockDb.del)
                .toHaveBeenCalled();
            expect(result)
                .toEqual(expectedResult);
        });
    });

    describe("get_format_systemdata method", () => {
        it("should return formatted systemdata object", async () => {
            const mockRawData = [
                {
                    key: "settings:icon",
                    value: "icon.png",
                    data: null,
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
                {
                    key: "app:name",
                    value: "Hirgon",
                    data: "{\"theme\": \"dark\"}",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
            ];

            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                select: jest.fn()
                    .mockResolvedValue(mockRawData),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.get_format_systemdata();

            expect(mockDb.where)
                .toHaveBeenCalledWith({});
            expect(mockDb.select)
                .toHaveBeenCalledWith("*");
            expect(result)
                .toEqual({
                    "settings:icon": {
                        value: "icon.png",
                        data: null,
                        created_at: "2025-01-01 00:00:00",
                        updated_at: "2025-01-01 00:00:00",
                    },
                    "app:name": {
                        value: "Hirgon",
                        data: "{\"theme\": \"dark\"}",
                        created_at: "2025-01-01 00:00:00",
                        updated_at: "2025-01-01 00:00:00",
                    },
                });
        });

        it("should handle empty result", async () => {
            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                select: jest.fn()
                    .mockResolvedValue([]),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.get_format_systemdata();

            expect(mockDb.where)
                .toHaveBeenCalledWith({});
            expect(mockDb.select)
                .toHaveBeenCalledWith("*");
            expect(result)
                .toEqual({});
        });

        it("should handle single entry", async () => {
            const mockRawData = [
                {
                    key: "single:key",
                    value: "single-value",
                    data: null,
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
            ];

            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                select: jest.fn()
                    .mockResolvedValue(mockRawData),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.get_format_systemdata();

            expect(mockDb.where)
                .toHaveBeenCalledWith({});
            expect(mockDb.select)
                .toHaveBeenCalledWith("*");
            expect(result)
                .toEqual({
                    "single:key": {
                        value: "single-value",
                        data: null,
                        created_at: "2025-01-01 00:00:00",
                        updated_at: "2025-01-01 00:00:00",
                    },
                });
        });

        it("should handle complex data structure", async () => {
            const mockRawData = [
                {
                    key: "complex:key",
                    value: "complex-value",
                    data: "{\"nested\": {\"key\": \"value\"}}",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
                {
                    key: "simple:key",
                    value: "simple-value",
                    data: null,
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
            ];

            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                select: jest.fn()
                    .mockResolvedValue(mockRawData),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.get_format_systemdata();

            expect(mockDb.where)
                .toHaveBeenCalledWith({});
            expect(mockDb.select)
                .toHaveBeenCalledWith("*");
            expect(result)
                .toEqual({
                    "complex:key": {
                        value: "complex-value",
                        data: "{\"nested\": {\"key\": \"value\"}}",
                        created_at: "2025-01-01 00:00:00",
                        updated_at: "2025-01-01 00:00:00",
                    },
                    "simple:key": {
                        value: "simple-value",
                        data: null,
                        created_at: "2025-01-01 00:00:00",
                        updated_at: "2025-01-01 00:00:00",
                    },
                });
        });

        it("should preserve data types correctly", async () => {
            const mockRawData = [
                {
                    key: "test:string",
                    value: "test-value",
                    data: "test-data",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
            ];

            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                select: jest.fn()
                    .mockResolvedValue(mockRawData),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.get_format_systemdata();

            expect(mockDb.where)
                .toHaveBeenCalledWith({});
            expect(mockDb.select)
                .toHaveBeenCalledWith("*");
            expect(result["test:string"])
                .toEqual({
                    value: "test-value",
                    data: "test-data",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                });
            expect(typeof result["test:string"].data)
                .toBe("string");
        });

        it("should handle null data gracefully", async () => {
            const mockRawData = [
                {
                    key: "test:null",
                    value: "test-value",
                    data: null,
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
                {
                    key: "test:undefined",
                    value: "test-value",
                    data: undefined,
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
            ];

            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                select: jest.fn()
                    .mockResolvedValue(mockRawData),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.get_format_systemdata();

            expect(mockDb.where)
                .toHaveBeenCalledWith({});
            expect(mockDb.select)
                .toHaveBeenCalledWith("*");
            expect(result["test:null"])
                .toEqual({
                    value: "test-value",
                    data: null,
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                });
            expect(result["test:undefined"])
                .toEqual({
                    value: "test-value",
                    data: undefined,
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                });
        });

        it("should handle edge cases", async () => {
            const mockRawData = [
                {
                    key: "",
                    value: "test-value",
                    data: "{}",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
                {
                    key: "test:empty",
                    value: "",
                    data: "",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                },
            ];

            const mockDb = {
                where: jest.fn()
                    .mockReturnThis(),
                select: jest.fn()
                    .mockResolvedValue(mockRawData),
            };
            systemdata.dbh = () => mockDb;

            const result = await systemdata.get_format_systemdata();

            expect(mockDb.where)
                .toHaveBeenCalledWith({});
            expect(mockDb.select)
                .toHaveBeenCalledWith("*");
            expect(result[""])
                .toEqual({
                    value: "test-value",
                    data: "{}",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                });
            expect(result["test:empty"])
                .toEqual({
                    value: "",
                    data: "",
                    created_at: "2025-01-01 00:00:00",
                    updated_at: "2025-01-01 00:00:00",
                });
        });
    });
});