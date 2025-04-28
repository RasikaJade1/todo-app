const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Task = require('../models/Task');

describe('Tasks Routes', () => {
  beforeAll(async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/testdb', {
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
    const task = await Task.create({ title: 'Test Task', completed: false });
    const res = await request(app).post(`/tasks/${task._id}/delete`);
    expect(res.status).toBe(302);
    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });
});