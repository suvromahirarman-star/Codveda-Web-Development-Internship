const path = require('path');
const dotenv = require('dotenv');

// Load server environment variables
const serverEnvPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: serverEnvPath });

// Enforce test environment
process.env.NODE_ENV = 'test';

// Set generous rate-limit thresholds for general integration tests to prevent accidental throttling
// (The dedicated security test suite will test rate-limiting thresholds explicitly)
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_GENERAL_MAX = '1000';
process.env.RATE_LIMIT_MUTATION_MAX = '1000';

// Global test timeout for cloud Atlas network calls
jest.setTimeout(25000);

