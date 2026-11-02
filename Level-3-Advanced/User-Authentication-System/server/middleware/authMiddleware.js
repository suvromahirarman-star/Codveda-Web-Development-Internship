const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes via JSON Web Token verification.
 * Enforces tokenVersion matching to invalidate sessions upon password change.
 */
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No authentication token provided'
    });
  }

  try {
    // 1. Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Retrieve user identity from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists'
      });
    }

    // 3. DIRECTIVE 3: Session Invalidation Check
    // If user changed password, decoded.tokenVersion will be lower than user.tokenVersion
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired due to a recent password change. Please log in again.'
      });
    }

    // 4. Attach authenticated user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token signature'
    });
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Restricts endpoint to users whose role is included in allowedRoles.
 */
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

