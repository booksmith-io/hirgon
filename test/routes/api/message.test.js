const request = require('supertest');
const { create_test_app } = require('../../helpers/express');

// Mock the dependencies
jest.mock('./../../../lib/dbh', () => {
  return jest.fn(() => global.resetMockDb());
});
jest.mock('./../../../lib/secure', () => ({
  requireAuth: (req, res, next) => {
    req.session = { user: { user_id: 1 }, authenticated: true };
    next();
  }
}));
jest.mock('./../../../models/messages');
jest.mock('./../../../lib/html');
jest.mock('./../../../lib/datetime');
jest.mock('./../../../lib/response', () => ({
  status: {
    HTTP_NOT_FOUND: { code: 404, string: 'Not Found' },
    HTTP_BAD_REQUEST: { code: 400, string: 'Bad Request' },
    HTTP_NO_CONTENT: { code: 204, string: 'No Content' },
    HTTP_INTERNAL_SERVER_ERROR: { code: 500, string: 'Internal Server Error' },
    HTTP_OK: { code: 200, string: 'OK' }
  }
}));
jest.mock('./../../../lib/session_util');

const apiMessageRouter = require('./../../../routes/api/message');
const { Messages } = require('./../../../models/messages');
const datetime = require('./../../../lib/datetime');
const session_util = require('./../../../lib/session_util');

describe('API Message Routes', () => {
  let app;
  let mockMessages;

  beforeEach(() => {
    jest.clearAllMocks();

    app = create_test_app();
    app.use('/api/message', apiMessageRouter);

    mockMessages = {
      get: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
    };

    // Mock the Messages constructor to return an instance with mocked dbh
    Messages.mockImplementation(() => {
      const mockDb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderByRaw: jest.fn().mockReturnThis(),
        del: jest.fn().mockResolvedValue(1),
        insert: jest.fn().mockResolvedValue([1]),
        update: jest.fn().mockResolvedValue(1)
      };

      return {
        get: mockMessages.get,
        update: mockMessages.update,
        remove: mockMessages.remove,
        create: mockMessages.create,
        dbh: jest.fn(() => mockDb)
      };
    });



    // Mock session_util methods that might be called
    session_util.empty_session = jest.fn();
    session_util.get_alert = jest.fn();
    session_util.set_alert = jest.fn();

    // Mock datetime functions
    datetime.datetime_is_future = jest.fn().mockResolvedValue(1);
  });

  describe('GET /api/message/:message_id', () => {
    it('should return message by id', async () => {
      jest.setTimeout(10000); // Increase timeout for this test
      const mockMessage = {
        message_id: 1,
        name: 'Test Message',
        body: 'Test body',
        active: 1,
        active_at: null,
        scheduled_at: null,
        created_at: '2025-01-01 10:00:00',
        updated_at: '2025-01-01 11:00:00'
      };

      mockMessages.get.mockResolvedValue([mockMessage]);

      const response = await request(app).get('/api/message/1');

      expect(mockMessages.get).toHaveBeenCalledWith({ message_id: '1' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMessage);
    });

    it('should return 404 for non-existent message', async () => {
      mockMessages.get.mockResolvedValue(null);

      const response = await request(app).get('/api/message/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Not Found' });
    });
  });

  describe('POST /api/message/:message_id', () => {
    it('should return 404 for non-existent message', async () => {
      mockMessages.get.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/message/999')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Not Found' });
    });

    it('should return 204 for no changes', async () => {
      const mockMessage = {
        message_id: 1,
        name: 'Test Message',
        body: 'Test body',
        active: 0,
        scheduled_at: null
      };

      mockMessages.get.mockResolvedValue([mockMessage]);
      mockMessages.update.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/message/1')
        .send({ name: 'Test Message', body: 'Test body' });

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should update message name', async () => {
      const mockMessage = {
        message_id: 1,
        name: 'Original Name',
        body: 'Test body',
        active: 0,
        scheduled_at: null
      };

      mockMessages.get.mockResolvedValue([mockMessage]);
      mockMessages.update.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/message/1')
        .send({ name: 'Updated Name' });

      expect(mockMessages.update).toHaveBeenCalledWith(
        { message_id: '1' },
        { name: 'Updated Name' }
      );
      expect(response.status).toBe(200);
    });

    it('should activate message', async () => {
      const mockMessage = {
        message_id: 1,
        name: 'Test Message',
        body: 'Test body',
        active: 0,
        scheduled_at: null
      };

      mockMessages.get.mockResolvedValue([mockMessage]);
      mockMessages.update.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/message/1')
        .send({ active: '1' });

      expect(mockMessages.update).toHaveBeenCalledWith(
        { message_id: '1' },
        { active: 1 }
      );
      expect(response.status).toBe(200);
    });

    it('should schedule message for future', async () => {
      const mockMessage = {
        message_id: 1,
        name: 'Test Message',
        body: 'Test body',
        active: 0,
        scheduled_at: null
      };

      mockMessages.get.mockResolvedValue([mockMessage]);
      mockMessages.update.mockResolvedValue(1);
      datetime.datetime_is_future.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/message/1')
        .send({
          schedule_date: '2025-12-31',
          schedule_time: '23:59:59'
        });

      expect(datetime.datetime_is_future).toHaveBeenCalledWith('2025-12-31 23:59:59');
      expect(mockMessages.update).toHaveBeenCalledWith(
        { message_id: '1' },
        { scheduled_at: '2025-12-31 23:59:59' }
      );
      expect(response.status).toBe(200);
    });

    it('should reject past scheduling', async () => {
      const mockMessage = {
        message_id: 1,
        name: 'Test Message',
        body: 'Test body',
        active: 0,
        scheduled_at: null
      };

      mockMessages.get.mockResolvedValue([mockMessage]);
      datetime.datetime_is_future.mockResolvedValue(0);

      const response = await request(app)
        .post('/api/message/1')
        .send({
          schedule_date: '2024-01-01',
          schedule_time: '12:00:00'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'scheduled_at must be in the future' });
    });
  });

  describe('DELETE /api/message/:message_id', () => {
    it('should return 404 for non-existent message', async () => {
      mockMessages.get.mockResolvedValue(null);

      const response = await request(app).delete('/api/message/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Not Found' });
    });

    it('should delete message successfully', async () => {
      const mockMessage = {
        message_id: 1,
        name: 'Test Message'
      };

      mockMessages.get.mockResolvedValue([mockMessage]);
      mockMessages.remove.mockResolvedValue(1);

      const response = await request(app).delete('/api/message/1');

      expect(mockMessages.remove).toHaveBeenCalledWith({ message_id: '1' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'OK' });
    });
  });

  describe('POST /api/message/', () => {
    it('should create active message', async () => {
      mockMessages.create.mockResolvedValue([1]);

      const response = await request(app)
        .post('/api/message/')
        .send({
          name: 'New Message',
          body: 'New body',
          active: '1'
        });

      expect(mockMessages.create).toHaveBeenCalledWith({
        name: 'New Message',
        body: 'New body',
        active: 1
      });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'OK' });
    });

    it('should create scheduled message', async () => {
      mockMessages.create.mockResolvedValue([1]);
      datetime.datetime_is_future.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/message/')
        .send({
          name: 'New Message',
          body: 'New body',
          schedule_date: '2025-12-31',
          schedule_time: '23:59:59'
        });

      expect(datetime.datetime_is_future).toHaveBeenCalledWith('2025-12-31 23:59:59');
      expect(mockMessages.create).toHaveBeenCalledWith({
        name: 'New Message',
        body: 'New body',
        scheduled_at: '2025-12-31 23:59:59'
      });
      expect(response.status).toBe(200);
    });

    it('should return error for missing name', async () => {
      const response = await request(app)
        .post('/api/message/')
        .send({ body: 'New body' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'The name and body parameters are required' });
    });

    it('should return error for missing body', async () => {
      const response = await request(app)
        .post('/api/message/')
        .send({ name: 'New Message' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'The name and body parameters are required' });
    });
  });
});