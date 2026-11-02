const mongoose = require('mongoose');
const { getTrackedProjectIds, getTrackedTaskIds, clearTrackers } = require('./testTracker');
const Project = require('../../models/Project');
const Task = require('../../models/Task');

/**
 * Sanitizes MongoDB connection URI for safe console logging.
 */
function sanitizeUri(uri) {
  if (!uri || typeof uri !== 'string') return 'UNSET';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

/**
 * Parses and strictly validates the test database URI.
 * Aborts immediately if:
 * 1. MONGODB_URI_TEST is not explicitly configured.
 * 2. It falls back to MONGODB_URI (strictly forbidden).
 * 3. Parsed database name is not exactly 'nexus_test'.
 */
function validateTestUri() {
  const testUri = process.env.MONGODB_URI_TEST;

  if (!testUri || !testUri.trim()) {
    throw new Error(
      'MANDATORY SAFETY BLOCK: MONGODB_URI_TEST is not explicitly configured in server/.env.\n' +
      'Tests strictly refuse to run without an explicitly configured test database.'
    );
  }

  let parsed;
  try {
    parsed = new URL(testUri.trim());
  } catch (err) {
    throw new Error(`MANDATORY SAFETY BLOCK: Failed to parse MONGODB_URI_TEST: ${err.message}`);
  }

  // Extract exact database name from URL pathname (e.g. /nexus_test -> nexus_test)
  const dbName = (parsed.pathname || '').replace(/^\/+/, '').split('?')[0];

  if (dbName !== 'nexus_test') {
    throw new Error(
      `MANDATORY SAFETY BLOCK: MONGODB_URI_TEST points to database "${dbName}".\n` +
      'Exact database name "nexus_test" is strictly required to prevent modifying production or other environments.'
    );
  }

  // Explicit safety check: verify it does not equal the production MONGODB_URI
  if (process.env.MONGODB_URI) {
    try {
      const prodParsed = new URL(process.env.MONGODB_URI.trim());
      const prodDbName = (prodParsed.pathname || '').replace(/^\/+/, '').split('?')[0];
      if (prodDbName === 'nexus' && dbName === prodDbName) {
        throw new Error('MANDATORY SAFETY BLOCK: Test URI matches production database "nexus". Aborting immediately.');
      }
    } catch {
      // Ignored: dbName !== 'nexus_test' check already passed
    }
  }

  return testUri.trim();
}

/**
 * Connects strictly to the validated nexus_test database on Atlas.
 */
async function connectTestDB() {
  const uri = validateTestUri();
  const maskedUri = sanitizeUri(uri);

  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.name !== 'nexus_test') {
      await mongoose.disconnect();
      throw new Error(
        `MANDATORY SAFETY BLOCK: Active connection is to "${mongoose.connection.name}", not "nexus_test". Disconnected.`
      );
    }
    return mongoose.connection;
  }

  console.log(`📡 [TEST DB] Connecting to verified test database: ${maskedUri}`);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });

  // Strict runtime identity verification
  if (conn.connection.name !== 'nexus_test') {
    await mongoose.disconnect();
    throw new Error(
      `FATAL SAFETY BLOCK: Mongoose connected to database "${conn.connection.name}" instead of "nexus_test". Connection severed.`
    );
  }

  console.log(`✅ [TEST DB] Verified connection to exact test database: ${conn.connection.name}`);
  return conn;
}

/**
 * Cleans up ONLY records tracked during test execution.
 * Never performs unrestricted collection-wide deletions or drops the database.
 */
async function cleanupTrackedRecords() {
  const projectIds = getTrackedProjectIds();
  const taskIds = getTrackedTaskIds();

  if (projectIds.length > 0) {
    await Project.deleteMany({ _id: { $in: projectIds } });
  }

  if (taskIds.length > 0) {
    await Task.deleteMany({ _id: { $in: taskIds } });
  }

  clearTrackers();
}

/**
 * Disconnects from test database safely after tests.
 */
async function disconnectTestDB() {
  await cleanupTrackedRecords();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  sanitizeUri,
  validateTestUri,
  connectTestDB,
  cleanupTrackedRecords,
  disconnectTestDB
};

