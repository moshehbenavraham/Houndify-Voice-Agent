const request = require('supertest');
const app = require('../src/server/server');

describe('Server Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/config', () => {
    it('should return client configuration', async () => {
      const response = await request(app).get('/api/config');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('clientId');
      expect(response.body).toHaveProperty('voiceRequestInfo');
      expect(response.body).not.toHaveProperty('clientKey'); // Should not expose client key
    });
  });

  describe('GET /', () => {
    it('should serve the main HTML file', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Endpoint not found');
    });
  });
});