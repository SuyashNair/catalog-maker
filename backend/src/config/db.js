const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If no MongoDB URI or using default local one, try in-memory server
    if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      try {
        // Try connecting to local MongoDB first
        await mongoose.connect(uri || 'mongodb://localhost:27017/catalog-maker', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        return;
      } catch {
        // Fall back to in-memory MongoDB
        console.log('Local MongoDB not found, starting in-memory server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log(`In-Memory MongoDB started: ${uri}`);
      }
    }

    await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  if (mongod) {
    await mongod.stop();
    console.log('In-memory MongoDB stopped');
  }
  process.exit(0);
});

module.exports = connectDB;
