const mongoose = require('mongoose');
const connectDB = require('../config/db');

jest.setTimeout(10000);

describe('Database Connection', () => {
  beforeAll(async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await mongoose.connection.close();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should connect to MongoDB successfully', async () => {
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/testdb';
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);
  }, 5000);

  it('should handle connection failure', async () => {
    process.env.MONGO_URI = 'mongodb://invalid:27017/testdb';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(mongoose, 'connect').mockRejectedValue(new Error('Connection failed'));
    await expect(connectDB()).rejects.toThrow('Connection failed');
    expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  }, 5000);
});