const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Task = require('../models/Task');

describe('To-Do App', () => {
  let server;

  beforeAll(async () => {
    mongoose.set('strictQuery', false); // Suppress warning
    server = app.listen(0); // Dynamic port
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  it('should load the homepage', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('To-Do List');
  });

  it('should add a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task' });
    expect(res.statusCode).toEqual(302);
  });

  it('should handle empty task title', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: '' });
    expect(res.statusCode).toEqual(302);
  });

  it('should return correct content type for homepage', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  it('should redirect to homepage after adding task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Redirect Test Task' });
    expect(res.statusCode).toEqual(302);
    expect(res.headers['location']).toBe('/');
  });

  it('should load edit page for a valid task', async () => {
    const task = new Task({ title: 'Edit Test Task' });
    await task.save();
    const res = await request(app).get(`/tasks/${task._id}/edit`);
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Edit Test Task');
  });

  it('should include stylesheet link on homepage', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('<link rel="stylesheet" href="/styles.css">');
  });
});