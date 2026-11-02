const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

/**
 * Connects to MongoDB using Mongoose with strict persistent database rules.
 * Does NOT fall back to in-memory databases.
 * Throws clear configuration and diagnostic errors if MongoDB is unavailable.
 */
async function connectDB() {
  let uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.error('\n============================================================');
    console.error('❌ [NEXUS DATABASE CONFIGURATION ERROR]');
    console.error('   MONGODB_URI environment variable is missing or empty.');
    console.error('   Please define MONGODB_URI in server/.env or root .env with:');
    console.error('     • MongoDB Atlas:  mongodb+srv://<user>:<password>@cluster0.mongodb.net/nexus?retryWrites=true&w=majority');
    console.error('============================================================\n');
    throw new Error('MONGODB_URI is required to establish persistent database connection.');
  }

  uri = uri.trim();

  // If user provided an Atlas URI ending with / without db name, append nexus database
  if (uri.startsWith('mongodb+srv://') && (uri.endsWith('.mongodb.net/') || uri.endsWith('.mongodb.net'))) {
    uri = uri.replace(/\/?$/, '/nexus?retryWrites=true&w=majority');
  }

  // Mask sensitive credentials if present in log output
  const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

  console.log(`📡 [NEXUS DATABASE] Connecting to persistent MongoDB: ${sanitizedUri}...`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000 // 10s timeout for cloud Atlas DNS/TLS handshake
    });

    console.log(`✅ [NEXUS DATABASE] Connected successfully to host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);

    // Safe initial seed check: Only runs if explicitly enabled AND collections are completely empty
    if (process.env.AUTO_SEED === 'true') {
      await safeInitialSeed();
    }

    return conn;
  } catch (error) {
    const safeErrorMsg = (error.message || '').replace(/\/\/([^:]+):([^@]+)@/g, '//***:***@');
    console.error('\n============================================================');
    console.error('❌ [NEXUS DATABASE CONNECTION FAILED]');
    console.error(`   Target URI: ${sanitizedUri}`);
    console.error(`   Error Message: ${safeErrorMsg}`);
    console.error('');
    console.error('   Troubleshooting:');
    console.error('   1. If using MongoDB Atlas: Verify your cluster Network Access /');
    console.error('      IP Access List (0.0.0.0/0) and Database User credentials.');
    console.error('   2. Verify that MONGODB_URI in server/.env starts with mongodb+srv://');
    console.error('============================================================\n');
    throw error;
  }
}

/**
 * Safe initial seeder that checks existing document counts.
 * Prevents duplicating seed data every time server restarts!
 */
async function safeInitialSeed() {
  try {
    const projectCount = await Project.countDocuments();
    if (projectCount > 0) {
      console.log(`📊 [NEXUS DATABASE] Existing data detected (${projectCount} projects). Auto-seed skipped.`);
      return;
    }

    console.log('🌱 [NEXUS DATABASE] Database is empty. Seeding initial demonstration data...');

    const seedProjects = [
      {
        name: 'Nexus Core Platform Redesign',
        description: 'Complete UI/UX design overhaul and microservice architecture modernization.',
        status: 'In Progress',
        priority: 'High',
        progress: 65,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Mobile Client Application',
        description: 'Native iOS and Android project companion applications built with React Native.',
        status: 'Active',
        priority: 'Medium',
        progress: 30,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Security & Compliance Audit',
        description: 'SOC2 Type II certification preparation, penetration testing, and access auditing.',
        status: 'Planning',
        priority: 'Urgent',
        progress: 10,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdProjects = await Project.insertMany(seedProjects);

    const seedTasks = [
      {
        title: 'Design high-fidelity dashboard wireframes',
        description: 'Create Figma components for project cards, analytics metrics, and sidebar.',
        status: 'Completed',
        priority: 'High',
        project: createdProjects[0]._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Implement Express REST API routes',
        description: 'Build controllers and routes for /api/projects and /api/tasks with validation.',
        status: 'Completed',
        priority: 'High',
        project: createdProjects[0]._id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Integrate MongoDB persistence layer',
        description: 'Connect Mongoose schemas and enforce validation rules and indexing.',
        status: 'In Progress',
        priority: 'High',
        project: createdProjects[0]._id,
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Set up push notification delivery pipeline',
        description: 'Configure Firebase Cloud Messaging integration for task assignments.',
        status: 'Todo',
        priority: 'Medium',
        project: createdProjects[1]._id,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Penetration test on authentication headers',
        description: 'Review CORS configuration, helmet headers, and parameter sanitization.',
        status: 'Review',
        priority: 'High',
        project: createdProjects[2]._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      }
    ];

    await Task.insertMany(seedTasks);
    console.log(`✅ [NEXUS DATABASE] Successfully seeded ${createdProjects.length} projects and ${seedTasks.length} tasks.`);
  } catch (err) {
    console.warn(`⚠️ [NEXUS DATABASE] Initial seed warning: ${err.message}`);
  }
}

module.exports = { connectDB, safeInitialSeed };

