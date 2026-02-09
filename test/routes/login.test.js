const bcrypt = require('bcryptjs');

// Mock the dependencies
jest.mock('./../../models/users');
jest.mock('./../../lib/session_util');
jest.mock('./../../lib/response', () => ({
  status: {
    HTTP_UNAUTHORIZED: { code: 401 }
  }
}));

const { Users } = require('./../../models/users');
const session_util = require('./../../lib/session_util');

// Import the route handler functions directly
const loginRouter = require('./../../routes/login');

describe('Login Route Handler', () => {
  let mockReq, mockRes, mockNext;
  let mockUsers;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      session: {
        authenticated: false,
        regenerate: jest.fn((callback) => callback()),
        user: null
      },
      body: {},
      url: '/login'
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      locals: {}
    };

    mockNext = jest.fn();

    mockUsers = {
      get: jest.fn(),
    };
    Users.mockImplementation(() => mockUsers);

    // Mock session_util
    session_util.get_alert = jest.fn().mockReturnValue(null);
    session_util.empty_session = jest.fn();
    session_util.set_alert = jest.fn();
  });

  describe('GET /login', () => {
    it('should redirect to home if already authenticated', () => {
      mockReq.session.authenticated = true;
      loginRouter.get(mockReq, mockRes, mockNext);

      expect(mockReq.session.regenerate).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });

    it('should render login page if not authenticated', () => {
      mockRes.locals.systemdata = { 'settings:icon': { value: 'test-icon.png' } };

      loginRouter.get(mockReq, mockRes, mockNext);

      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.render).toHaveBeenCalledWith('login', {
        layout: false,
        icon: 'test-icon.png',
        alert: undefined
      });
    });
  });

  describe('POST /login', () => {
    it('should return error for missing credentials', () => {
      mockReq.body = {};
      mockRes.locals.systemdata = { 'settings:icon': { value: 'test-icon.png' } };

      loginRouter.post(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.render).toHaveBeenCalledWith('login', {
        layout: false,
        icon: 'test-icon.png',
        alert: {
          type: 'danger',
          message: 'The email and password parameters are required'
        }
      });
    });

    it('should return error for non-existent user', () => {
      mockReq.body = { email: 'nonexistent@example.com', password: 'password123' };
      mockRes.locals.systemdata = { 'settings:icon': { value: 'test-icon.png' } };
      mockUsers.get.mockResolvedValue([]);

      loginRouter.post(mockReq, mockRes, mockNext);

      expect(mockUsers.get).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.render).toHaveBeenCalledWith('login', {
        layout: false,
        icon: 'test-icon.png',
        alert: {
          type: 'danger',
          message: 'The email and password parameters are required'
        }
      });
    });

    it('should return error for incorrect password', () => {
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwd: bcrypt.hashSync('correctpassword', 10),
        active: 1,
        created_at: '2025-01-01 00:00:00',
        updated_at: '2025-01-01 00:00:00'
      };

      mockReq.body = { email: 'test@example.com', password: 'wrongpassword' };
      mockRes.locals.systemdata = { 'settings:icon': { value: 'test-icon.png' } };
      mockUsers.get.mockResolvedValue([mockUser]);

      loginRouter.post(mockReq, mockRes, mockNext);

      expect(mockUsers.get).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.render).toHaveBeenCalledWith('login', {
        layout: false,
        icon: 'test-icon.png',
        alert: {
          type: 'danger',
          message: 'The email and password parameters are required'
        }
      });
    });

    it('should login successfully with correct credentials', () => {
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwd: bcrypt.hashSync('correctpassword123', 10),
        active: 1,
        created_at: '2025-01-01 00:00:00',
        updated_at: '2025-01-01 00:00:00'
      };

      mockReq.body = { email: 'test@example.com', password: 'correctpassword123' };
      mockUsers.get.mockResolvedValue([mockUser]);

      loginRouter.post(mockReq, mockRes, mockNext);

      expect(mockUsers.get).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(session_util.empty_session).toHaveBeenCalled();
      expect(mockReq.session.regenerate).toHaveBeenCalled();
      expect(mockReq.session.authenticated).toBe(true);
      expect(mockReq.session.user).toEqual({
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        active: 1,
        created_at: '2025-01-01 00:00:00',
        updated_at: '2025-01-01 00:00:00'
      });
      expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });
  });
});