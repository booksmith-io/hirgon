const request = require('supertest');
const { createTestApp } = require('../../helpers/express');

// Mock the dependencies
jest.mock('./../../../lib/secure');
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

const secure = require('./../../../lib/secure');
const apiMessageRouter = require('./../../../routes/api/message');
const { Messages } = require('./../../../models/messages');
const datetime = require('./../../../lib/datetime');

describe('API Message Routes', () => {
  let app;
  let mockMessages;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = createTestApp();
    app.use('/api/message', apiMessageRouter);

    mockMessages = {
      get: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
    };
    Messages.mockImplementation(() => mockMessages);
    
    // Mock secure middleware
    secure.requireAuth = (req, res, next) => {
      req.session = { user: { user_id: 1 } };
      next();
    };
    
    // Mock datetime functions
    datetime.datetime_is_future = jest.fn().mockResolvedValue(1);
  });

  describe('GET /api/message/:message_id', () => {
    it('should return message by id', async () => {
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
      mockMessages.get.mockResolvedValue([]);

      const response = await request(app).get('/api/message/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Not Found' });
    });
  });

  describe('POST /api/message/:message_id', () => {
    it('should return 404 for non-existent message', async () => {
      mockMessages.get.mockResolvedValue([]);

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
      expect(response.body).toEqual({ message: 'No Content' });
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
      mockMessages.get.mockResolvedValue([]);

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