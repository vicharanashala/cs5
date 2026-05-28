/**
 * =============================================================================
 * QUERY.IN - DATABASE CONNECTION CONFIGURATION
 * =============================================================================
 * Establishes a robust MongoDB connection using the Mongoose ODM.
 * Implements connection pooling, event listeners for monitoring, and
 * automatic reconnection handling for production reliability.
 *
 * @module config/db
 */

const mongoose = require('mongoose');

// Destructure connection string and options from environment variables
// Fallback to localhost for local development
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queryin';

const connectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Establishes the database connection and sets up event listeners
 * to monitor connection health and lifecycle events.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB with the configured options
    const conn = await mongoose.connect(MONGO_URI, connectionOptions);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Event: Connection disconnected - triggers automatic reconnection attempt
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    // Event: Connection error - logs the error for debugging
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    // Event: Reconnected - confirms successful reconnection
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Handle application termination gracefully
    // Ensures all pending operations complete before closing the connection
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    // Log the full error stack for debugging
    console.error(`❌ Failed to connect to MongoDB: ${error.message}`);
    // Exit the process with a non-zero code to indicate failure
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler - ensures clean disconnection from MongoDB
 * when the Node.js process is terminated (e.g., during deployment or restart).
 */
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error during graceful shutdown: ${error.message}`);
    process.exit(1);
  }
};

// Export the connection function and mongoose instance for use in models
module.exports = { connectDB, mongoose };