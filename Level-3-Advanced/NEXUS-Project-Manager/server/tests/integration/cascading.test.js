const request = require('supertest');
const app = require('../../app');
const Task = require('../../models/Task');
const { connectTestDB, cleanupTrackedRecords, disconnectTestDB } = require('../helpers/dbHelper');
const { trackProject, trackTask } = require('../helpers/testTracker');

describe('Integration: Cascading Relational Deletion (against nexus_test)', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await cleanupTrackedRecords();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  test('deleting a project cascades and deletes all associated child tasks', async () => {
    // 1. Create a parent project
    const pRes = await request(app).post('/api/projects').send({
      name: `Cascade Parent Project ${Date.now()}`,
      status: 'In Progress'
    });
    const projectId = pRes.body.data._id;
    trackProject(projectId);

    // 2. Create 3 linked child tasks
    const taskIds = [];
    for (let i = 1; i <= 3; i++) {
      const tRes = await request(app).post('/api/tasks').send({
        title: `Child Task ${i} for Cascade`,
        project: projectId,
        status: 'Todo'
      });
      taskIds.push(tRes.body.data._id);
      trackTask(tRes.body.data._id);
    }

    // 3. Verify all 3 tasks exist in database
    const initialTasks = await Task.find({ project: projectId });
    expect(initialTasks.length).toBe(3);

    // 4. Delete parent project
    const delRes = await request(app).delete(`/api/projects/${projectId}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    // 5. Verify that child tasks were cascaded and deleted automatically
    const remainingTasks = await Task.find({ project: projectId });
    expect(remainingTasks.length).toBe(0);

    // 6. Verify each task ID returns 404 when queried
    for (const tid of taskIds) {
      const checkRes = await request(app).get(`/api/tasks/${tid}`);
      expect(checkRes.statusCode).toBe(404);
    }
  });
});

