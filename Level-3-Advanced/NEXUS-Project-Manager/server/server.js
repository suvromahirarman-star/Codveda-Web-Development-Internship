const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables: check server/.env first, then root .env if present
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Initializes database connection and starts HTTP server only upon successful connection.
 */
async function startServer() {
  try {
    // 1. Establish strict persistent MongoDB connection first
    await connectDB();

    // 2. Start Express HTTP server only after database is confirmed available
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('============================================================');
      console.log(`🚀 [NEXUS SERVER] Running on port ${PORT}`);
      console.log(`   API Base URL: http://localhost:${PORT}/api`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   Client Allowed: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log('============================================================\n');
    });

    // Graceful process termination
    const shutdown = async (signal) => {
      console.log(`\n🛑 [NEXUS SERVER] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        const mongoose = require('mongoose');
        await mongoose.connection.close(false);
        console.log('✅ [NEXUS SERVER] Database connection and HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('\n❌ [NEXUS SERVER STARTUP ABORTED]');
    console.error('   The HTTP server was NOT started because the MongoDB connection failed.');
    console.error('   Resolve the database issue and start again.\n');
    process.exit(1);
  }
}

startServer();

