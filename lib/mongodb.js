import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents creating new connections on every API call.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongoDB() {
  try {
    // If we have a cached connection, return it
    if (cached.conn) {
      console.log('Using cached MongoDB connection');
      return cached.conn;
    }

    // If no promise exists, create a new connection
    if (!cached.promise) {
      const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false, // Disable mongoose buffering
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
        socketTimeoutMS: 45000, // 45 seconds timeout for sockets
      };

      console.log('Creating new MongoDB connection...');
      
      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('MongoDB connected successfully');
          return mongoose;
        })
        .catch((error) => {
          // Reset promise on error to allow retry
          cached.promise = null;
          console.error('MongoDB connection failed:', error);
          throw error;
        });
    }

    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
    return cached.conn;

  } catch (error) {
    console.error('Error in connectMongoDB:', error);
    // Reset both conn and promise on error
    cached.conn = null;
    cached.promise = null;
    throw error;
  }
}

// Optional: Handle connection events for better debugging
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Close connection when app is terminated
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default connectMongoDB;