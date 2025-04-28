const mongoose = require('mongoose');
const connectDB = require('../config/db');

jest.setTimeout(10000); // Reset to 10s

describe('Database Connection', () => {
  beforeAll(async () => {
    mongoose.set('strictQuery', false); // Suppress warning
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await mongoose.connection.close();
    jest.restoreAllMocks(); // Reset mocks
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should connect to MongoDB successfully', async () => {
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/testdb';
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // Connected
  }, 5000);

  it('should handle connection failure', async () => {
    process.env.MONGO_URI = 'mongodb://invalid:27017/testdb';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock mongoose.connect to throw an error
    jest.spyOn(mongoose, 'connect').mockRejectedValue(new Error('Connection failed'));
    await expect(connectDB()).rejects.toThrow('Connection failed');
    expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  }, 5000);
});