const html = require('./../../lib/html');

describe('HTML Utils', () => {
  describe('replace_newlines', () => {
    it('should replace Windows-style newlines with <br>', () => {
      const input = 'Line 1\r\nLine 2\r\nLine 3';
      const expected = 'Line 1<br>Line 2<br>Line 3';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should handle single Windows newline', () => {
      const input = 'Line 1\r\nLine 2';
      const expected = 'Line 1<br>Line 2';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should handle multiple consecutive Windows newlines', () => {
      const input = 'Line 1\r\n\r\nLine 2';
      const expected = 'Line 1<br><br>Line 2';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should handle Unix-style newlines (they will not be replaced)', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      const expected = 'Line 1\nLine 2\nLine 3';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should handle empty string', () => {
      const input = '';
      const expected = '';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should return undefined for null input', () => {
      const result = html.replace_newlines(null);
      
      expect(result).toBeNull();
    });

    it('should return undefined for undefined input', () => {
      const result = html.replace_newlines(undefined);
      
      expect(result).toBeUndefined();
    });

    it('should handle string with no newlines', () => {
      const input = 'Single line text';
      const expected = 'Single line text';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should handle string with only newlines', () => {
      const input = '\r\n\r\n';
      const expected = '<br><br>';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should handle mixed newline styles', () => {
      const input = 'Line 1\r\nLine 2\nLine 3\r\nLine 4';
      const expected = 'Line 1<br>Line 2\nLine 3<br>Line 4';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should handle whitespace around newlines', () => {
      const input = 'Line 1 \r\n Line 2';
      const expected = 'Line 1 <br> Line 2';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });

    it('should handle special characters with newlines', () => {
      const input = 'Hello & world\r\nGoodbye & world';
      const expected = 'Hello & world<br>Goodbye & world';
      
      const result = html.replace_newlines(input);
      
      expect(result).toBe(expected);
    });
  });
});