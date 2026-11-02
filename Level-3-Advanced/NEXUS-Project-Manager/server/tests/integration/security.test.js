const request = require('supertest');
const app = require('../../app');
const { connectTestDB, cleanupTrackedRecords, disconnectTestDB } = require('../helpers/dbHelper');
const { trackProject } = require('../helpers/testTracker');

describe('Integration: Security Protections & Hardening', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanupTrackedRecords();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });
  describe('Search Query Length Boundaries & ReDoS Defense', () => {
    test('rejects search query longer than 100 characters with HTTP 400', async () => {
      const longQuery = 'A'.repeat(101);
      const res = await request(app).get(`/api/projects?search=${longQuery}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds maximum allowed length of 100 characters');
    });

    test('accepts search query of exactly 100 characters without error', async () => {
      const exactQuery = 'B'.repeat(100);
      const res = await request(app).get(`/api/projects?search=${exactQuery}`);

      // Either 200 (if DB connected) or 400 validation error not triggered
      expect(res.statusCode).not.toBe(400);
    });

    test('safely evaluates exponential ReDoS pattern without hanging', async () => {
      const redosPattern = '((a+)+)+$';
      const start = Date.now();
      const res = await request(app).get(`/api/projects?search=${encodeURIComponent(redosPattern)}`);
      const duration = Date.now() - start;

      expect(res.statusCode).not.toBe(400);
      expect(duration).toBeLessThan(1500); // Must resolve without event-loop lag
    });
  });

  describe('Request Body Size Hardening (100KB Limit)', () => {
    test('rejects oversized JSON payload (>100KB) with HTTP 413 Payload Too Large', async () => {
      const oversizedString = 'X'.repeat(125 * 1024); // 125 KB
      const res = await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ name: 'Oversized', description: oversizedString }));

      expect(res.statusCode).toBe(413);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('100KB');
    });

    test('accepts normal payload (<100KB) through body parser', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send({ name: `Valid Size Project ${Date.now()}`, description: 'Small standard description' });

      // Body-parser accepted the payload (not 413)
      expect(res.statusCode).not.toBe(413);
      if (res.body?.data?._id) {
        trackProject(res.body.data._id);
      }
    });
  });

  describe('Rate Limiting & Reverse Proxy Headers', () => {
    test('includes standard RateLimit-* headers on API endpoints', async () => {
      const res = await request(app).get('/api/projects');

      expect(res.headers['ratelimit-limit']).toBeDefined();
      expect(res.headers['ratelimit-remaining']).toBeDefined();
      // Legacy headers must be disabled
      expect(res.headers['x-ratelimit-limit']).toBeUndefined();
    });

    test('trust proxy is disabled by default to prevent client IP spoofing', () => {
      expect(app.get('trust proxy')).toBe(false);
    });
  });
});
