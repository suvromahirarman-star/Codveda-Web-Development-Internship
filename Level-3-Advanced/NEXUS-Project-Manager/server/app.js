const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const statsRoutes = require('./routes/statsRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Reverse proxy trust setting
// Keep disabled by default unless explicitly configured via TRUST_PROXY.
// Enabling blindly without an upstream reverse proxy (e.g. NGINX, Cloudflare) allows clients to spoof X-Forwarded-For.
if (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);

// Body parsers - hardened to 100kb (rejects oversized JSON/form payloads to prevent memory exhaustion DoS)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// HTTP Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint (mounted before rate limiters so monitoring probes never trigger rate limits)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'NEXUS Project Management API',
    database: 'MongoDB (Persistent)',
    timestamp: new Date().toISOString()
  });
});

// Rate Limiting Configuration
const apiLimiterWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const generalLimiterMax = parseInt(process.env.RATE_LIMIT_GENERAL_MAX, 10) || 300;
const mutationLimiterMax = parseInt(process.env.RATE_LIMIT_MUTATION_MAX, 10) || 60;

// General API rate limiter for all /api endpoints
const generalLimiter = rateLimit({
  windowMs: apiLimiterWindow,
  max: generalLimiterMax,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false,  // Disable deprecated X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Stricter mutation rate limiter for state-changing operations (POST, PUT, DELETE)
const mutationLimiter = rateLimit({
  windowMs: apiLimiterWindow,
  max: mutationLimiterMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !['POST', 'PUT', 'DELETE'].includes(req.method),
  message: {
    success: false,
    message: 'Too many project/task modification requests from this IP. Please try again after 15 minutes.'
  }
});

// Apply rate limiters to /api routes
app.use('/api', generalLimiter);
app.use('/api', mutationLimiter);

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;

