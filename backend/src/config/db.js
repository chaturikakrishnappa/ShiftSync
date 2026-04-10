const mongoose = require('mongoose');

/**
 * Connects to MongoDB with robust error handling for authentication
 * and connection issues.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // 1. Validate URI presence
  if (!uri) {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: MONGODB_URI is not defined in .env');
    console.error('Please provide a valid MongoDB connection string.');
    process.exit(1);
  }

  // 2. Configure Mongoose options
  mongoose.set('strictQuery', false);

  const options = {
    maxPoolSize: process.env.NODE_ENV === 'production' ? 20 : 10,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4, skip trying IPv6
  };

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, options);
    console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB Connected Successfully');
  } catch (err) {
    // 3. Handle specific authentication errors
    if (err.message.includes('authentication failed') || err.code === 8000) {
      console.error('\x1b[31m%s\x1b[0m', '❌ MONGODB AUTHENTICATION FAILED');
      console.error('Check your username and password in MONGODB_URI.');
      console.error('Note: Special characters in password must be URL-encoded (e.g., @ as %40).');
    } else if (err.name === 'MongooseServerSelectionError') {
      console.error('\x1b[31m%s\x1b[0m', '❌ MONGODB CONNECTION TIMEOUT');
      console.error('Could not reach the database. Check your IP Whitelist in Atlas.');
    } else {
      console.error('\x1b[31m%s\x1b[0m', `❌ MONGODB ERROR: ${err.message}`);
    }

    // Stop the process as requested - we don't want a zombie server
    process.exit(1);
  }
}

module.exports = { connectDB };
