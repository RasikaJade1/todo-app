const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Mock environment for tests
jest.setTimeout(10000); // Increase timeout for MongoDB connections

describe('Database Connection', () => {
  beforeAll(async () => {
    // Ensure no existing connections
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Close connections after each test
    await mongoose.connection.close();
  });

  afterAll(async () => {
    // Final cleanup
    await mongoose.disconnect();
  });

  it('should connect to MongoDB successfully', async () => {
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/testdb';
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // Connected
  });

  it('should handle connection failure', async () => {
    process.env.MONGO_URI = 'mongodb://invalid:27017/testdb';
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(connectDB()).rejects.toThrowError(/getaddrinfo ENOTFOUND/); // Match MongoDB error
    expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
