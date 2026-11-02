/**
 * Centralized Error Handling Middleware for Authentication API.
 * Converts Mongoose and operational errors into structured, safe JSON responses.
 * Never exposes credentials, database strings, or internal stack traces to clients.
 */

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // DIRECTIVE 5: Safe MongoDB Duplicate Key Error (Unique Email Index)
  if (err.code === 11000) {
    statusCode = 409;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'email';
    message = `An account with this ${field} already exists. Please sign in or use a different email address.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = err.errors ? Object.values(err.errors).map((el) => el.message) : [err.message];
    message = `Validation Failed: ${errors.join(', ')}`;
  }

  // Mongoose Bad ObjectId or Invalid Field Cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid identifier format: ${err.value}`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Log error safely on server side (mask any potential credentials)
  const safeLogMsg = (message || '').replace(/\/\/([^:]+):([^@]+)@/g, '//***:***@');
  console.error(`❌ [AUTH API ERROR] ${req.method} ${req.originalUrl} - ${statusCode} - ${safeLogMsg}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { errorName: err.name })
  });
};

