const secure = require('./../../lib/secure');
const session_util = require('./../../lib/session_util');

describe('Security Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
    mockNext = jest.fn();

    // Mock session_util to handle undefined session
    jest.spyOn(session_util, 'empty_session').mockImplementation(() => {});
    jest.spyOn(session_util, 'set_alert').mockImplementation(() => {});
  });

  describe('requireAuth middleware', () => {
    it('should call next() when user is authenticated', () => {
      mockReq.session = { authenticated: true };

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to login for unauthenticated web requests', () => {
      mockReq.session = { authenticated: false };
      mockReq.locals = {};

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should redirect to login when session exists but not authenticated', () => {
      mockReq.session = {};
      mockReq.locals = {};

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });

    it('should return JSON error for unauthenticated API requests', () => {
      mockReq.session = { authenticated: false };
      mockReq.locals = { api: true };

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "You're not authenticated"
      });
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should return JSON error when API flag is set differently', () => {
      mockReq.session = null;
      mockReq.locals = { api: true };

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "You're not authenticated"
      });
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should handle missing session gracefully', () => {
      mockReq.session = undefined;
      mockReq.locals = {};

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });

    it('should handle missing locals gracefully', () => {
      mockReq.session = { authenticated: false };

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });

    it('should handle locals.api being false', () => {
      mockReq.session = { authenticated: false };
      mockReq.locals = { api: false };

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle partial session data', () => {
      mockReq.session = { user: { id: 1 } };
      mockReq.locals = {};

      secure.requireAuth(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('protected middleware (backward compatibility)', () => {
    it('should call next() when user is authenticated', () => {
      mockReq.session = { authenticated: true };

      secure.protected(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('should redirect to login for unauthenticated requests', () => {
      mockReq.session = { authenticated: false };
      mockReq.locals = {};

      secure.protected(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });
  });
});