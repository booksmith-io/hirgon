const { Base } = require('./../../models/base');

describe('Base Model', () => {
  let base;
  let mockDb;

  beforeEach(() => {
    mockDb = global.resetMockDb();
    base = new Base();
    // The dbh should now be our mocked version
    expect(base.dbh).toBeDefined();
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

      mockDb.select.mockResolvedValue(expectedResult);

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

      mockDb.update.mockResolvedValue(expectedResult);

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

      mockDb.insert.mockResolvedValue(expectedResult);

      const result = await base.create(inserts);

      expect(mockDb.insert).toHaveBeenCalledWith(inserts);
      expect(result).toEqual(expectedResult);
    });
  });
});