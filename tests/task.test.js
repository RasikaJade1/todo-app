const request = require('supertest');
const app = require('../app');
const Task = require('../models/Task');
const mongoose = require('mongoose');

describe('Tasks Routes', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should delete a task', async () => {
    // Create a task
    const task = await Task.create({ title: 'Test Task', completed: false });
    // Delete the task using POST /tasks/:id/delete
    const res = await request(app).post(`/tasks/${task._id}/delete`);
    expect(res.status).toBe(302); // Expect redirect after deletion
    // Verify task is deleted
    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });
});
