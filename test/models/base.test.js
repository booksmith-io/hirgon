const { Base } = require('./../../models/base');

describe('Base Model', () => {
  let base;

  beforeEach(() => {
    jest.clearAllMocks();
    base = new Base();
  });

  describe('constructor', () => {
    it('should initialize with dbh and set table name', () => {
      expect(base.dbh).toBeDefined();
      expect(base._table).toBe('base');
    });
  });

  describe('get method', () => {
    it('should call database with correct parameters', async () => {
      const columns = ['id', 'name'];
      const selector = { id: 1 };
      const expectedResult = [{ id: 1, name: 'test' }];

      // Mock the dbh method directly on the instance
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(expectedResult)
      };
      base.dbh = () => mockDb;

      const result = await base.get(columns, selector);

      expect(mockDb.where).toHaveBeenCalledWith(selector);
      expect(mockDb.select).toHaveBeenCalledWith(columns);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update method', () => {
    it('should call database update with correct parameters', async () => {
      const selector = { id: 1 };
      const updates = { name: 'updated' };
      const expectedResult = 1;

      // Mock the dbh method directly on the instance
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue(expectedResult)
      };
      base.dbh = () => mockDb;

      const result = await base.update(selector, updates);

      expect(mockDb.where).toHaveBeenCalledWith(selector);
      expect(mockDb.update).toHaveBeenCalledWith(updates);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create method', () => {
    it('should call database insert with correct parameters', async () => {
      const inserts = { name: 'new record' };
      const expectedResult = [1];

      // Mock the dbh method directly on the instance
      const mockDb = {
        insert: jest.fn().mockResolvedValue(expectedResult)
      };
      base.dbh = () => mockDb;

      const result = await base.create(inserts);

      expect(mockDb.insert).toHaveBeenCalledWith(inserts);
      expect(result).toEqual(expectedResult);
    });
  });
});