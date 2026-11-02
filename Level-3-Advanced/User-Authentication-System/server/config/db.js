const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using Mongoose with strict persistence rules.
 * Never falls back to in-memory databases.
 * Throws clear configuration and diagnostic errors if MongoDB is unavailable.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.error('\n============================================================');
    console.error('❌ [AUTH DATABASE CONFIGURATION ERROR]');
    console.error('   MONGODB_URI environment variable is missing or empty.');
    console.error('   Please define MONGODB_URI in server/.env with:');
    console.error('     • MongoDB Atlas: mongodb+srv://<user>:<password>@cluster0.mongodb.net/auth_system?retryWrites=true&w=majority');
    console.error('============================================================\n');
    throw new Error('MONGODB_URI is required to establish persistent database connection.');
  }

  // Mask sensitive credentials if present in log output
  const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

  console.log(`📡 [AUTH DATABASE] Connecting to persistent MongoDB: ${sanitizedUri}...`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000 // 10s timeout for cloud Atlas DNS/TLS handshake
    });

    console.log(`✅ [AUTH DATABASE] Connected successfully to host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    const safeErrorMsg = (error.message || '').replace(/\/\/([^:]+):([^@]+)@/g, '//***:***@');
    console.error('\n============================================================');
    console.error('❌ [AUTH DATABASE CONNECTION FAILED]');
    console.error(`   Target URI: ${sanitizedUri}`);
    console.error(`   Error Message: ${safeErrorMsg}`);
    console.error('');
    console.error('   Troubleshooting:');
    console.error('   1. Verify your MongoDB Atlas Network Access (IP Access List: 0.0.0.0/0).');
    console.error('   2. Verify your Database User credentials in server/.env.');
    console.error('============================================================\n');
    throw error;
  }
}

module.exports = { connectDB };

