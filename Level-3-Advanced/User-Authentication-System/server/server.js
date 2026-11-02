const path = require('path');
const dotenv = require('dotenv');

// DIRECTIVE 6: Load environment variables strictly from canonical server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Initializes database connection and starts HTTP server only upon successful connection.
 */
async function startServer() {
  try {
    // 1. Establish strict persistent MongoDB Atlas connection first
    await connectDB();

    // 2. Start Express HTTP server explicitly bound to 0.0.0.0
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('============================================================');
      console.log(`🚀 [AUTH SERVER] Running on port ${PORT} (0.0.0.0)`);
      console.log(`   API Base URL: http://localhost:${PORT}/api/auth`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   Client Allowed: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log('============================================================\n');
    });

    // Graceful process termination
    const shutdown = async (signal) => {
      console.log(`\n🛑 [AUTH SERVER] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        const mongoose = require('mongoose');
        await mongoose.connection.close(false);
        console.log('✅ [AUTH SERVER] Database connection and HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('\n❌ [AUTH SERVER STARTUP ABORTED]');
    console.error('   The HTTP server was NOT started because the MongoDB connection failed.');
    console.error('   Resolve the database issue and start again.\n');
    process.exit(1);
  }
}

startServer();

