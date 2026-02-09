const request = require('supertest');
const express = require('express');

// Mock the dependencies
jest.mock('./../../lib/session_util');

const logoutRouter = require('./../../routes/logout');
const session_util = require('./../../lib/session_util');

describe('Logout Routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
      req.session = { authenticated: true };
      next();
    });
    app.use('/logout', logoutRouter);
  });

  describe('GET /logout', () => {
    it('should empty session and set success message', async () => {
      session_util.empty_session.mockImplementation(() => {});
      session_util.set_alert.mockImplementation(() => {});

      const response = await request(app).get('/logout');

      expect(session_util.empty_session).toHaveBeenCalled();
      expect(session_util.set_alert).toHaveBeenCalledWith(
        expect.any(Object),
        {
          type: 'info',
          message: "You've been logged out"
        }
      );
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/login');
    });

    it('should work even if session is not authenticated', async () => {
      const unauthApp = express();
      unauthApp.use((req, res, next) => {
        req.session = { authenticated: false };
        next();
      });
      unauthApp.use('/logout', logoutRouter);

      session_util.empty_session.mockImplementation(() => {});
      session_util.set_alert.mockImplementation(() => {});

      const response = await request(unauthApp).get('/logout');

      expect(session_util.empty_session).toHaveBeenCalled();
      expect(session_util.set_alert).toHaveBeenCalled();
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/login');
    });
  });
});