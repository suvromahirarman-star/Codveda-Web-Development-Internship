const request = require('supertest');
const app = require('../../app');
const { connectTestDB, cleanupTrackedRecords, disconnectTestDB } = require('../helpers/dbHelper');
const { trackProject, trackTask } = require('../helpers/testTracker');

describe('Integration: Task CRUD Workflows (against nexus_test)', () => {
  let parentProjectId;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    // Create a fresh parent project for each test
    const pRes = await request(app).post('/api/projects').send({
      name: `Parent Project for Task Tests ${Date.now()}`,
      status: 'In Progress'
    });
    parentProjectId = pRes.body.data._id;
    trackProject(parentProjectId);
  });

  afterEach(async () => {
    await cleanupTrackedRecords();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  test('POST /api/tasks - creates a new task linked to parent project (HTTP 201)', async () => {
    const taskPayload = {
      title: `Integration Task ${Date.now()}`,
      description: 'Action item description',
      status: 'Todo',
      priority: 'High',
      project: parentProjectId
    };

    const res = await request(app).post('/api/tasks').send(taskPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.title).toBe(taskPayload.title);
    
    // Project can be populated as an object or returned as string ID
    const returnedProjId = res.body.data.project?._id || res.body.data.project;
    expect(returnedProjId).toBe(parentProjectId);

    trackTask(res.body.data._id);
  });

  test('POST /api/tasks - rejects task missing parent project link (HTTP 400)', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Orphaned Task',
      status: 'Todo'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('assigned to a valid Project');
  });

  test('POST /api/tasks - rejects task with title shorter than 2 characters (HTTP 400)', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Z',
      project: parentProjectId
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('at least 2 characters');
  });

  test('GET /api/tasks - retrieves tasks filtered by parent project', async () => {
    const tRes = await request(app).post('/api/tasks').send({
      title: `Task for Filter ${Date.now()}`,
      project: parentProjectId,
      status: 'In Progress'
    });
    trackTask(tRes.body.data._id);

    const listRes = await request(app).get(`/api/tasks?project=${parentProjectId}`);
    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const found = listRes.body.data.find((t) => t._id === tRes.body.data._id);
    expect(found).toBeDefined();
  });

  test('PUT /api/tasks/:id - updates task status and triggers parent progress recalculation', async () => {
    const tRes = await request(app).post('/api/tasks').send({
      title: `Status Transition Task ${Date.now()}`,
      project: parentProjectId,
      status: 'Todo'
    });
    const taskId = tRes.body.data._id;
    trackTask(taskId);

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'Completed' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.status).toBe('Completed');
  });

  test('DELETE /api/tasks/:id - removes task successfully (HTTP 200)', async () => {
    const tRes = await request(app).post('/api/tasks').send({
      title: `Delete Task Target ${Date.now()}`,
      project: parentProjectId
    });
    const taskId = tRes.body.data._id;

    const delRes = await request(app).delete(`/api/tasks/${taskId}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Verify task is gone
    const getRes = await request(app).get(`/api/tasks/${taskId}`);
    expect(getRes.statusCode).toBe(404);
  });
});
