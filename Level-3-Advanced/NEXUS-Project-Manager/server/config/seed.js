const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables: check server/.env first, then root .env if present
const serverEnvPath = path.join(__dirname, '..', '.env');
const rootEnvPath = path.join(__dirname, '..', '..', '.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

const Project = require('../models/Project');
const Task = require('../models/Task');

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in server/.env');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB to execute manual seed...`);
  await mongoose.connect(uri);

  console.log('Clearing existing Projects and Tasks...');
  await Task.deleteMany({});
  await Project.deleteMany({});

  console.log('Inserting seed records...');

  const projects = await Project.insertMany([
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
  ]);

  await Task.insertMany([
    {
      title: 'Design high-fidelity dashboard wireframes',
      description: 'Create Figma components for project cards, analytics metrics, and sidebar.',
      status: 'Completed',
      priority: 'High',
      project: projects[0]._id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Implement Express REST API routes',
      description: 'Build controllers and routes for /api/projects and /api/tasks with validation.',
      status: 'Completed',
      priority: 'High',
      project: projects[0]._id,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Integrate MongoDB persistence layer',
      description: 'Connect Mongoose schemas and enforce validation rules and indexing.',
      status: 'In Progress',
      priority: 'High',
      project: projects[0]._id,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Set up push notification delivery pipeline',
      description: 'Configure Firebase Cloud Messaging integration for task assignments.',
      status: 'Todo',
      priority: 'Medium',
      project: projects[1]._id,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Penetration test on authentication headers',
      description: 'Review CORS configuration, helmet headers, and parameter sanitization.',
      status: 'Review',
      priority: 'High',
      project: projects[2]._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  ]);

  console.log('✅ Manual seed completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

