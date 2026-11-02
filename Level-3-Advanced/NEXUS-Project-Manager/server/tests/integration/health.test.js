const request = require('supertest');
const app = require('../../app');

describe('Integration: /api/health Endpoint', () => {
  test('returns HTTP 200 with service metadata', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      service: 'NEXUS Project Management API',
      database: 'MongoDB (Persistent)'
    });
    expect(res.body.timestamp).toBeDefined();
  });

  test('health check bypasses rate limiters and emits no RateLimit headers', async () => {
    // Perform multiple rapid health requests
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.headers['ratelimit-limit']).toBeUndefined();
      expect(res.headers['ratelimit-remaining']).toBeUndefined();
    }
  });
});

