const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token (JWT) with user claims and expiration.
 * Encodes tokenVersion to facilitate session revocation on password change.
 *
 * @param {Object} user - User Mongoose document
 * @returns {string} - Signed JWT token
 */
function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }

  const payload = {
    id: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion !== undefined ? user.tokenVersion : 0
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  };

  return jwt.sign(payload, secret, options);
}

module.exports = generateToken;

