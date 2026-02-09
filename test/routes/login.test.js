const request = require('supertest');
const bcrypt = require('bcryptjs');
const { create_test_app } = require('../helpers/express');

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
const loginRouter = require('./../../routes/login');

describe('Login Route Handler', () => {
  let app;
  let mockUsers;

  beforeEach(() => {
    jest.clearAllMocks();

    app = create_test_app();
    app.use('/login', loginRouter);

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
    it('should render login page if not authenticated', async () => {
      const response = await request(app).get('/login');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Login page rendered successfully');
    });

    it('should render login page if not authenticated', async () => {
      const response = await request(app).get('/login');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Login page rendered successfully');
    });
  });

  describe('POST /login', () => {
    it('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({});

      expect(response.status).toBe(401);
      expect(response.text).toContain('Login page with error rendered');
    });

    it('should return error for non-existent user', async () => {
      mockUsers.get.mockResolvedValue([]);

      const response = await request(app)
        .post('/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(mockUsers.get).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(response.status).toBe(401);
      expect(response.text).toContain('Login page with error rendered');
    });

    it('should return error for incorrect password', async () => {
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwd: bcrypt.hashSync('correctpassword', 10),
        active: 1,
        created_at: '2025-01-01 00:00:00',
        updated_at: '2025-01-01 00:00:00'
      };

      mockUsers.get.mockResolvedValue([mockUser]);

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(mockUsers.get).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(response.status).toBe(401);
      expect(response.text).toContain('Login page with error rendered');
    });

    it('should return error for correct credentials but with server error', async () => {
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwd: bcrypt.hashSync('correctpassword123', 10),
        active: 1,
        created_at: '2025-01-01 00:00:00',
        updated_at: '2025-01-01 00:00:00'
      };

      mockUsers.get.mockResolvedValue([mockUser]);

      const response = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'correctpassword123' });

      expect(mockUsers.get).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(response.status).toBe(500);
    });
  });
});