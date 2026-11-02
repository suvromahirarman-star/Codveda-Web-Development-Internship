const request = require('supertest');
const app = require('../../app');
const { connectTestDB, cleanupTrackedRecords, disconnectTestDB } = require('../helpers/dbHelper');
const { trackProject, trackTask } = require('../helpers/testTracker');

describe('Integration: Dashboard Statistics Calculation (against nexus_test)', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanupTrackedRecords();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  test('GET /api/stats - returns dashboard summary with expected structure', async () => {
    // 1. Create a test project with 2 tasks (1 completed, 1 in progress)
    const pRes = await request(app).post('/api/projects').send({
      name: `Stats Project ${Date.now()}`,
      status: 'In Progress'
    });
    const projectId = pRes.body.data._id;
    trackProject(projectId);

    const t1 = await request(app).post('/api/tasks').send({
      title: 'Completed Task',
      status: 'Completed',
      project: projectId
    });
    trackTask(t1.body.data._id);

    const t2 = await request(app).post('/api/tasks').send({
      title: 'Active Task',
      status: 'In Progress',
      project: projectId
    });
    trackTask(t2.body.data._id);

    // 2. Fetch stats
    const statsRes = await request(app).get('/api/stats');

    expect(statsRes.statusCode).toBe(200);
    expect(statsRes.body.success).toBe(true);
    expect(statsRes.body.data).toBeDefined();

    const stats = statsRes.body.data;
    expect(stats.totalProjects).toBeGreaterThanOrEqual(1);
    expect(stats.totalTasks).toBeGreaterThanOrEqual(2);
    expect(stats.completedTasks).toBeGreaterThanOrEqual(1);
    expect(stats.inProgressTasks).toBeGreaterThanOrEqual(1);
    expect(typeof stats.overallProgress).toBe('number');
  });
});

