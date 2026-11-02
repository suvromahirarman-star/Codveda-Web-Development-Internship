const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * POST /api/auth/register
 * Registers a new user account.
 * DIRECTIVE 1: Enforces 'user' role; client cannot self-assign 'admin'.
 * DIRECTIVE 5: Safely catches existing account before insert.
 * DIRECTIVE 7: Pre-save hook hashes password exactly once.
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Proactive duplicate email check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in or use another email.'
      });
    }

    // 2. Create user with explicitly forced 'user' role
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password, // Pre-save hook handles hashing
      role: 'user', // Hardcoded role guarantees no privilege escalation during registration
      tokenVersion: 0
    });

    // 3. Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns signed JWT token.
 * Uses generic invalid credentials error to prevent user enumeration.
 */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch user including password hash
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // 2. Verify password with timing-safe comparison
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // 4. Generate token with current tokenVersion
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated user's profile.
 * Protected by verifyToken middleware.
 */
exports.getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      tokenVersion: req.user.tokenVersion,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    }
  });
};

/**
 * PUT /api/auth/profile
 * Updates authenticated user profile details.
 * DIRECTIVE 4: Users cannot modify their role or tokenVersion.
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // Whitelist only permitted fields
    if (req.body.name !== undefined) {
      user.name = req.body.name.trim();
    }

    if (req.body.email !== undefined) {
      const normalizedEmail = req.body.email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        // Check if new email is already claimed
        const emailExists = await User.findOne({ email: normalizedEmail });
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'This email address is already in use by another account'
          });
        }
        user.email = normalizedEmail;
      }
    }

    // Password, role, and tokenVersion are never updated here
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/change-password
 * Changes user password and invalidates prior JWT sessions.
 * DIRECTIVE 3: Increments tokenVersion so previously issued tokens fail authorization.
 * DIRECTIVE 7: Pre-save hook hashes new password once.
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // 1. Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match our records'
      });
    }

    // 2. Set new password (pre-save hook hashes this once)
    user.password = newPassword;

    // 3. Increment tokenVersion to revoke all active tokens issued previously
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.passwordChangedAt = new Date();

    await user.save();

    // 4. Issue fresh JWT corresponding to the new tokenVersion
    const freshToken = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. All other active sessions have been invalidated.',
      token: freshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/admin
 * Protected endpoint accessible only to accounts with 'admin' role.
 * Demonstrates Role-Based Access Control (RBAC).
 */
exports.getAdminData = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Admin Command Center',
    data: {
      authorizedRole: req.user.role,
      systemStatus: 'Operational',
      securityCompliance: 'Strict DevSecOps Standard (BCrypt + JWT + Token Versioning)',
      timestamp: new Date().toISOString()
    }
  });
};

