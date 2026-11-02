const request = require('supertest');
const app = require('../../app');
const { connectTestDB, cleanupTrackedRecords, disconnectTestDB } = require('../helpers/dbHelper');
const { trackProject } = require('../helpers/testTracker');

describe('Integration: Project CRUD Workflows (against nexus_test)', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanupTrackedRecords();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  test('POST /api/projects - creates a new project with valid data (HTTP 201)', async () => {
    const payload = {
      name: `Test Project Alpha ${Date.now()}`,
      description: 'Integration test project description',
      status: 'In Progress',
      priority: 'High',
      progress: 25
    };

    const res = await request(app).post('/api/projects').send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.status).toBe('In Progress');
    expect(res.body.data.priority).toBe('High');

    trackProject(res.body.data._id);
  });

  test('POST /api/projects - rejects payload with missing name (HTTP 400)', async () => {
    const res = await request(app).post('/api/projects').send({
      description: 'Missing name test',
      status: 'Planning'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Project name is required');
  });

  test('POST /api/projects - rejects name shorter than 2 characters (HTTP 400)', async () => {
    const res = await request(app).post('/api/projects').send({
      name: 'X',
      description: 'Too short name'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('at least 2 characters');
  });

  test('GET /api/projects - retrieves project list and filters by status', async () => {
    // Create test project
    const pRes = await request(app).post('/api/projects').send({
      name: `Filter Test Project ${Date.now()}`,
      status: 'Active',
      priority: 'Medium'
    });
    trackProject(pRes.body.data._id);

    const listRes = await request(app).get('/api/projects?status=Active');
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const found = listRes.body.data.find((p) => p._id === pRes.body.data._id);
    expect(found).toBeDefined();
    expect(found.status).toBe('Active');
  });

  test('GET /api/projects/:id - retrieves a single project by valid ID', async () => {
    const pRes = await request(app).post('/api/projects').send({
      name: `Single Get Project ${Date.now()}`,
      priority: 'Urgent'
    });
    const projectId = pRes.body.data._id;
    trackProject(projectId);

    const getRes = await request(app).get(`/api/projects/${projectId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data._id).toBe(projectId);
  });

  test('GET /api/projects/:id - returns 404 for non-existent ObjectId', async () => {
    const nonExistentId = '664500000000000000000000';
    const res = await request(app).get(`/api/projects/${nonExistentId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/projects/:id - returns 400 for malformed ObjectId', async () => {
    const res = await request(app).get('/api/projects/not-a-valid-id');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid Project ID format');
  });

  test('PUT /api/projects/:id - updates existing project fields', async () => {
    const pRes = await request(app).post('/api/projects').send({
      name: `Initial Name ${Date.now()}`,
      status: 'Planning'
    });
    const projectId = pRes.body.data._id;
    trackProject(projectId);

    const updateRes = await request(app)
      .put(`/api/projects/${projectId}`)
      .send({ status: 'Completed', progress: 100 });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.status).toBe('Completed');
    expect(updateRes.body.data.progress).toBe(100);
  });

  test('DELETE /api/projects/:id - removes project from database (HTTP 200)', async () => {
    const pRes = await request(app).post('/api/projects').send({
      name: `Delete Target Project ${Date.now()}`
    });
    const projectId = pRes.body.data._id;

    const delRes = await request(app).delete(`/api/projects/${projectId}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Verify it is gone
    const getRes = await request(app).get(`/api/projects/${projectId}`);
    expect(getRes.statusCode).toBe(404);
  });
});
