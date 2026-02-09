const { Users } = require('./../../models/users');

describe('Users Model', () => {
  let users;

  beforeEach(() => {
    jest.clearAllMocks();
    users = new Users();
  });

  describe('constructor', () => {
    it('should initialize with table name "users"', () => {
      expect(users._table).toBe('users');
    });
  });

  describe('get method', () => {
    it('should call super.get with correct columns and selector', async () => {
      const selector = { user_id: 1 };
      const expectedResult = [
        {
          user_id: 1,
          name: 'Test User',
          email: 'test@example.com',
          passwd: 'hashed_password',
          active: 1,
          created_at: '2025-01-01 00:00:00',
          updated_at: '2025-01-01 00:00:00'
        }
      ];

      // Mock the dbh method directly on the instance
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(expectedResult)
      };
      users.dbh = () => mockDb;

      const result = await users.get(selector);

      expect(mockDb.where).toHaveBeenCalledWith(selector);
      expect(mockDb.select).toHaveBeenCalledWith([
        'user_id',
        'name',
        'email',
        'passwd',
        'active',
        'created_at',
        'updated_at'
      ]);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('check_passwd_complexity method', () => {
    it('should return error when password is missing', () => {
      const result = users.check_passwd_complexity(null);
      expect(result).toEqual([false, 'The password argument is required']);
    });

    it('should return error when password is empty string', () => {
      const result = users.check_passwd_complexity('');
      expect(result).toEqual([false, 'The password argument is required']);
    });

    it('should return error when password is too short', () => {
      const result = users.check_passwd_complexity('short');
      expect(result).toEqual([false, 'The password argument must be at least 12 characters']);
    });

    it('should return error when password has no uppercase', () => {
      const result = users.check_passwd_complexity('lowercase12345');
      expect(result).toEqual([false, 'The password argument must have at least 1 uppercase character']);
    });

    it('should return error when password has no lowercase', () => {
      const result = users.check_passwd_complexity('UPPERCASE12345');
      expect(result).toEqual([false, 'The password argument must have at least 1 lowercase character']);
    });

    it('should return error when password has no numeric', () => {
      const result = users.check_passwd_complexity('MixedCasePassword');
      expect(result).toEqual([false, 'The password argument must have at least 1 numeric character']);
    });

    it('should return true for valid password', () => {
      const result = users.check_passwd_complexity('ValidPassword123');
      expect(result).toBe(true);
    });

    it('should return true for valid password with special characters', () => {
      const result = users.check_passwd_complexity('ValidPassword123!@#');
      expect(result).toBe(true);
    });

    it('should return true for exactly 12 character password with all requirements', () => {
      const result = users.check_passwd_complexity('ValidPass12!!');
      expect(result).toBe(true);
    });
  });
});