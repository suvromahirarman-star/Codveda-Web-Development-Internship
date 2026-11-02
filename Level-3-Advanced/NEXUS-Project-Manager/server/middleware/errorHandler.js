/**
 * Centralized Error Handling Middleware
 * Converts Mongoose, body-parser, and operational errors into structured, safe JSON responses.
 * Never exposes credentials or raw server stack traces to client callers.
 */

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Body parser payload too large (HTTP 413)
  if (err.status === 413 || err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request payload exceeds the maximum allowed size of 100KB';
  }

  // Mongoose Bad ObjectId or Invalid Field Cast (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message =
      err.path === '_id' || err.path === 'project'
        ? `Invalid identifier format: ${err.value}`
        : `Invalid format for field '${err.path}': ${err.value}`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = err.errors ? Object.values(err.errors).map((el) => el.message) : [err.message];
    message = `Validation Failed: ${errors.join(', ')}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : (err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field');
    message = `Duplicate field value entered for '${field}'. Please provide a unique value.`;
  }

  // Log error safely on server side
  console.error(`❌ [API ERROR] ${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { errorName: err.name })
  });
};

