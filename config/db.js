const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false); // Suppress warning
    mongoose.set('debug', true); // Enable query logging
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports = connectDB;