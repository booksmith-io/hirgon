const request = require('supertest');
const { create_test_app } = require('../helpers/express');
const bcrypt = require('bcryptjs');

// Mock the dependencies
jest.mock('./../../lib/dbh', () => {
  return jest.fn(() => global.resetMockDb());
});
jest.mock('./../../lib/secure', () => ({
  requireAuth: (req, res, next) => {
    req.session = { user: { user_id: 1 }, authenticated: true };
    res.locals = {
      user: {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }
    };
    next();
  },
  protected: (req, res, next) => {
    req.session = { user: { user_id: 1 }, authenticated: true };
    res.locals = {
      user: {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com'
      }
    };
    next();
  }
}));
jest.mock('./../../models/users');
jest.mock('./../../models/systemdata');
jest.mock('./../../lib/response', () => ({
  status: {
    HTTP_BAD_REQUEST: { code: 400 },
    HTTP_INTERNAL_SERVER_ERROR: { code: 500 },
    HTTP_UNAUTHORIZED: { code: 401 }
  }
}));
jest.mock('./../../lib/icons', () => ({
  icons: ['icon1', 'icon2', 'icon3']
}));

const settingsRouter = require('./../../routes/settings');
const { Users } = require('./../../models/users');
const { Systemdata } = require('./../../models/systemdata');

describe('Settings Routes', () => {
  let app;
  let mockUsers;
  let mockSystemdata;

  beforeEach(() => {
    jest.clearAllMocks();

    app = create_test_app();
    app.use('/settings', settingsRouter);

    mockUsers = {
      get: jest.fn(),
      update: jest.fn(),
    };
    mockSystemdata = {
      get: jest.fn(),
      get_format_systemdata: jest.fn(),
      update: jest.fn(),
    };

    Users.mockImplementation(() => mockUsers);
    Systemdata.mockImplementation(() => mockSystemdata);
  });

  describe('GET /settings', () => {
    it('should redirect to profile', async () => {
      const response = await request(app).get('/settings');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('settings/profile');
    });
  });

  describe('GET /settings/profile', () => {
    it('should render profile page', async () => {
      const response = await request(app).get('/settings/profile');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /settings/profile', () => {
    it('should return error for missing parameters', async () => {
      const response = await request(app)
        .post('/settings/profile')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should return error for missing name', async () => {
      const response = await request(app)
        .post('/settings/profile')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(401);
    });

    it('should return error for missing email', async () => {
      const response = await request(app)
        .post('/settings/profile')
        .send({ name: 'Test User' });

      expect(response.status).toBe(401);
    });

    it('should update profile successfully', async () => {
      const mockUpdatedUser = {
        user_id: 1,
        name: 'Updated Name',
        email: 'updated@example.com',
        active: 1,
        created_at: '2025-01-01 00:00:00',
        updated_at: '2025-01-01 12:00:00'
      };

      mockUsers.update.mockResolvedValue(1);
      mockUsers.get.mockResolvedValue([mockUpdatedUser]);

      const response = await request(app)
        .post('/settings/profile')
        .send({ name: 'Updated Name', email: 'updated@example.com' });

      expect(mockUsers.update).toHaveBeenCalledWith(
        { user_id: 1 },
        { name: 'Updated Name', email: 'updated@example.com' }
      );
      expect(response.status).toBe(200);
    });

    it('should return error if update fails', async () => {
      mockUsers.update.mockResolvedValue(0);

      const response = await request(app)
        .post('/settings/profile')
        .send({ name: 'Updated Name', email: 'updated@example.com' });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /settings/password', () => {
    it('should render password page', async () => {
      const response = await request(app).get('/settings/password');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /settings/password', () => {
    it('should return error for missing parameters', async () => {
      const response = await request(app)
        .post('/settings/password')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should return error for missing old password', async () => {
      const response = await request(app)
        .post('/settings/password')
        .send({
          new_password: 'newpass123',
          confirm_new_password: 'newpass123'
        });

      expect(response.status).toBe(401);
    });

    it('should return error for incorrect old password', async () => {
      const mockUser = {
        user_id: 1,
        passwd: bcrypt.hashSync('oldpassword123', 10)
      };

      mockUsers.get.mockResolvedValue([mockUser]);

      const response = await request(app)
        .post('/settings/password')
        .send({
          old_password: 'wrongpassword',
          new_password: 'newpass123',
          confirm_new_password: 'newpass123'
        });

      expect(response.status).toBe(401);
    });

    it('should update password successfully', async () => {
      const mockUser = {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwd: bcrypt.hashSync('oldpassword123', 10),
        active: 1,
        created_at: '2025-01-01 00:00:00',
        updated_at: '2025-01-01 00:00:00'
      };

      mockUsers.get.mockResolvedValue([mockUser]);
      mockUsers.update.mockResolvedValue(1);

      const response = await request(app)
        .post('/settings/password')
        .send({
          old_password: 'oldpassword123',
          new_password: 'NewPassword123',
          confirm_new_password: 'NewPassword123'
        });

      expect(mockUsers.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('GET /settings/icon', () => {
    it('should render icon page with current icon', async () => {
      const mockIcon = [{
        key: 'settings:icon',
        value: 'icon2',
        data: null
      }];

      mockSystemdata.get.mockResolvedValue(mockIcon);

      const response = await request(app).get('/settings/icon');
      expect(response.status).toBe(200);
      expect(mockSystemdata.get).toHaveBeenCalledWith({ key: 'settings:icon' });
    });

    it('should return error if icon not found', async () => {
      mockSystemdata.get.mockResolvedValue([]);

      const response = await request(app).get('/settings/icon');
      expect(response.status).toBe(401);
    });
  });

  describe('POST /settings/icon', () => {
    it('should return error for missing icon', async () => {
      const mockIcon = [{
        key: 'settings:icon',
        value: 'icon2',
        data: null
      }];

      mockSystemdata.get.mockResolvedValue(mockIcon);

      const response = await request(app)
        .post('/settings/icon')
        .send({});

      expect(response.status).toBe(401);
    });

    it('should update icon successfully', async () => {
      const mockIcon = [{
        key: 'settings:icon',
        value: 'icon2',
        data: null
      }];

      const mockSystemData = {
        'settings:icon': { value: 'icon1' }
      };

      mockSystemdata.get.mockResolvedValue(mockIcon);
      mockSystemdata.update.mockResolvedValue(1);
      mockSystemdata.get_format_systemdata.mockResolvedValue(mockSystemData);

      const response = await request(app)
        .post('/settings/icon')
        .send({ icon: 'icon1' });

      expect(mockSystemdata.update).toHaveBeenCalledWith(
        { key: 'settings:icon' },
        { value: 'icon1' }
      );
      expect(response.status).toBe(200);
    });
  });
});