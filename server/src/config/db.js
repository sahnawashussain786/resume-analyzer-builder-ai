import mongoose from 'mongoose';

/**
 * Connects to MongoDB.
 * - Uses MONGO_URI from .env when provided (e.g. MongoDB Atlas).
 * - Falls back to a local in-memory MongoDB for quick dev/testing if no URI is set.
 */
const connectDB = async () => {
  if (process.env.MONGO_URI) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ Could not connect to MONGO_URI: ${error.message}`);
      console.log('↪️  Falling back to in-memory MongoDB...');
    }
  }

  if (process.env.NODE_ENV === 'production' && !process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is required in production');
    process.exit(1);
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri());
    console.log(`✅ In-memory MongoDB started (${mem.getUri()}) — data resets on restart. Set MONGO_URI in server/.env for persistent storage.`);
  } catch (err) {
    console.error('❌ MongoMemoryServer failed to start:', err.message);
    process.exit(1);
  }
};

export default connectDB;
