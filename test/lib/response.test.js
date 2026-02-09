const response = require('./../../lib/response');

describe('Response Utils', () => {
  describe('status object', () => {
    it('should contain all expected HTTP status codes', () => {
      expect(response.status).toBeDefined();
      expect(response.status.HTTP_OK).toBeDefined();
      expect(response.status.HTTP_NO_CONTENT).toBeDefined();
      expect(response.status.HTTP_BAD_REQUEST).toBeDefined();
      expect(response.status.HTTP_UNAUTHORIZED).toBeDefined();
      expect(response.status.HTTP_FORBIDDEN).toBeDefined();
      expect(response.status.HTTP_NOT_FOUND).toBeDefined();
      expect(response.status.HTTP_UNACCEPTABLE).toBeDefined();
      expect(response.status.HTTP_CONFLICT).toBeDefined();
      expect(response.status.HTTP_INTERNAL_SERVER_ERROR).toBeDefined();
    });

    it('should have correct success status codes', () => {
      expect(response.status.HTTP_OK.code).toBe(200);
      expect(response.status.HTTP_OK.string).toBe('OK');

      expect(response.status.HTTP_NO_CONTENT.code).toBe(204);
      expect(response.status.HTTP_NO_CONTENT.string).toBe('No content');
    });

    it('should have correct client error status codes', () => {
      expect(response.status.HTTP_BAD_REQUEST.code).toBe(400);
      expect(response.status.HTTP_BAD_REQUEST.string).toBe('Something isn\'t correct with your request');

      expect(response.status.HTTP_UNAUTHORIZED.code).toBe(401);
      expect(response.status.HTTP_UNAUTHORIZED.string).toBe('You\'re not authenticated');

      expect(response.status.HTTP_FORBIDDEN.code).toBe(403);
      expect(response.status.HTTP_FORBIDDEN.string).toBe('You\'re not authorized to access this resource');

      expect(response.status.HTTP_NOT_FOUND.code).toBe(404);
      expect(response.status.HTTP_NOT_FOUND.string).toBe('That resource wasn\'t found');

      expect(response.status.HTTP_UNACCEPTABLE.code).toBe(406);
      expect(response.status.HTTP_UNACCEPTABLE.string).toBe('Fuck you');

      expect(response.status.HTTP_CONFLICT.code).toBe(409);
      expect(response.status.HTTP_CONFLICT.string).toBe('That resource already exists');
    });

    it('should have correct server error status codes', () => {
      expect(response.status.HTTP_INTERNAL_SERVER_ERROR.code).toBe(500);
      expect(response.status.HTTP_INTERNAL_SERVER_ERROR.string).toBe('Well that\'s embarrassing. Something unexpected happened on our end.');
    });

    it('should have consistent structure for all status objects', () => {
      const statuses = Object.values(response.status);

      statuses.forEach(status => {
        expect(status).toHaveProperty('code');
        expect(status).toHaveProperty('string');
        expect(typeof status.code).toBe('number');
        expect(typeof status.string).toBe('string');
      });
    });

    it('should have valid HTTP status codes', () => {
      const validCodes = [200, 204, 400, 401, 403, 404, 406, 409, 500];
      const statusCodes = Object.values(response.status).map(s => s.code);

      statusCodes.forEach(code => {
        expect(validCodes).toContain(code);
      });
    });

    it('should have unique status codes', () => {
      const statusCodes = Object.values(response.status).map(s => s.code);
      const uniqueCodes = [...new Set(statusCodes)];

      expect(statusCodes.length).toBe(uniqueCodes.length);
    });
  });
});