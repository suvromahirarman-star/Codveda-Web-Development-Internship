const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Mongoose Schema
 * Represents an authenticated user identity within the system.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ],
      index: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Concealed from queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'user' // Default role for all registrations
    },
    tokenVersion: {
      type: Number,
      default: 0 // Incremented upon password change to invalidate older JWTs
    },
    passwordChangedAt: {
      type: Date,
      default: null
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * DIRECTIVE 7: SINGLE-HASH GUARANTEE
 * Password hashing is centralized exclusively in this Mongoose pre-save hook.
 * Controllers NEVER invoke bcrypt.hash() manually.
 */
userSchema.pre('save', async function (next) {
  // If password was not modified, skip re-hashing
  if (!this.isModified('password')) {
    return next();
  }

  // Work factor 10 (~80ms computational cost)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance Method: Verify candidate password against stored bcrypt hash.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

