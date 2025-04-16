const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

// Suppress Mongoose deprecation warning
mongoose.set('strictQuery', false);

// Connect to MongoDB before tests
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
  }
});

// Disconnect after tests
afterAll(async () => {
  await mongoose.disconnect();
});

describe('To-Do App', () => {
  it('should load the homepage', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });

  it('should add a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task' });
    expect(res.statusCode).toEqual(302);
  });
});