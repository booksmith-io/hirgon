const request = require('supertest');
const { create_test_app } = require('../helpers/express');

// Mock the dependencies
jest.mock('./../../lib/dbh', () => {
  return jest.fn(() => global.resetMockDb());
});
jest.mock('./../../lib/secure', () => ({
  requireAuth: (req, res, next) => {
    req.session = { user: { user_id: 1, name: 'Test User' }, authenticated: true };
    res.locals.user = { user_id: 1, name: 'Test User' };
    next();
  }
}));
jest.mock('./../../models/messages');
jest.mock('./../../lib/html');

const homeRouter = require('./../../routes/home');
const { Messages } = require('./../../models/messages');
const html = require('./../../lib/html');

describe('Home Routes', () => {
  let app;
  let mockMessages;

  beforeEach(() => {
    jest.clearAllMocks();

    app = create_test_app();
    app.use('/', homeRouter);

    mockMessages = {
      get: jest.fn(),
    };
    Messages.mockImplementation(() => mockMessages);



    // Mock html.replace_newlines
    html.replace_newlines = jest.fn((text) => text.replace(/\n/g, '<br>'));
  });

  describe('GET /', () => {
    it('should render home page with messages', async () => {
      const mockMessagesData = [
        {
          message_id: 1,
          name: 'Test Message',
          body: 'Test body with\nnewlines',
          active: 1,
          active_at: null,
          scheduled_at: null,
          created_at: '2025-01-01 10:00:00',
          updated_at: '2025-01-01 11:00:00'
        },
        {
          message_id: 2,
          name: 'Another Message',
          body: 'Another body',
          active: 0,
          active_at: null,
          scheduled_at: '2025-01-02 12:00:00',
          created_at: '2025-01-01 09:00:00',
          updated_at: '2025-01-01 10:00:00'
        }
      ];

      mockMessages.get.mockResolvedValue(mockMessagesData);

      const response = await request(app).get('/');

      expect(mockMessages.get).toHaveBeenCalledWith({});
      expect(html.replace_newlines).toHaveBeenCalledWith('Test body with\nnewlines');
      expect(html.replace_newlines).toHaveBeenCalledWith('Another body');
      expect(response.status).toBe(200);
    }, 10000);

    it('should render home page with empty messages', async () => {
      mockMessages.get.mockResolvedValue([]);

      const response = await request(app).get('/');

      expect(mockMessages.get).toHaveBeenCalledWith({});
      expect(response.status).toBe(200);
    }, 10000);
  });
});