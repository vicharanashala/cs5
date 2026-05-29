/**
 * =============================================================================
 * QUERY.IN - USER MODEL
 * =============================================================================
 * Defines the User schema for authentication and role-based access control.
 * Stores email credentials and assigns one of three roles: admin, moderator, or intern.
 * Password hashing (via bcrypt) is handled in the auth middleware layer, not here.
 *
 * Relationships:
 * - Intern queries reference User via intern_id
 * - Responses reference User via author_id
 * - Queries resolved_by reference User (nullable)
 * - Announcements reference User via admin_id
 *
 * @model User
 * @field {String} email - Unique email address for authentication
 * @field {String} password - Hashed password (bcrypt handled in middleware)
 * @field {String} role - Enum: 'admin' | 'moderator' | 'intern'
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'moderator', 'intern'],
        message: 'Role must be one of: admin, moderator, intern',
      },
    },
    warning_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_disabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;