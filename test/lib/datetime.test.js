const datetime = require('./../../lib/datetime');

describe('Datetime Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('datetime_is_future validation', () => {
    it('should throw error for null datetime', async () => {
      await expect(datetime.datetime_is_future(null))
        .rejects
        .toThrow('datetime is required');
    });

    it('should throw error for undefined datetime', async () => {
      await expect(datetime.datetime_is_future(undefined))
        .rejects
        .toThrow('datetime is required');
    });

    it('should throw error for empty string datetime', async () => {
      await expect(datetime.datetime_is_future(''))
        .rejects
        .toThrow('datetime is required');
    });

    it('should throw error for invalid datetime format', async () => {
      await expect(datetime.datetime_is_future('2025-01-01'))
        .rejects
        .toThrow('2025-01-01 is not a valid datetime string');
    });

    it('should throw error for malformed datetime', async () => {
      await expect(datetime.datetime_is_future('invalid-date'))
        .rejects
        .toThrow('invalid-date is not a valid datetime string');
    });

    it('should throw error for datetime with wrong separators', async () => {
      await expect(datetime.datetime_is_future('2025/01/01 12:00:00'))
        .rejects
        .toThrow('2025/01/01 12:00:00 is not a valid datetime string');
    });

    it('should throw error for datetime with wrong time format', async () => {
      await expect(datetime.datetime_is_future('2025-01-01 12:00'))
        .rejects
        .toThrow('2025-01-01 12:00 is not a valid datetime string');
    });

    it('should validate datetime regex pattern', () => {
      const datetime_regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

      expect(datetime_regex.test('2025-12-31 23:59:59')).toBe(true);
      expect(datetime_regex.test('2025-01-01 00:00:00')).toBe(true);
      expect(datetime_regex.test('2025-06-15 14:30:45')).toBe(true);
      expect(datetime_regex.test('2025-12-31')).toBe(false);
      expect(datetime_regex.test('invalid')).toBe(false);
      expect(datetime_regex.test('2025/12/31 23:59:59')).toBe(false);
    });
  });

  describe('localtime function', () => {
    it('should have localtime function exported', () => {
      expect(typeof datetime.localtime).toBe('function');
    });

    it('should have datetime_is_future function exported', () => {
      expect(typeof datetime.datetime_is_future).toBe('function');
    });
  });
});