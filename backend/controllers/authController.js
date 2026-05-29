/**
 * =============================================================================
 * QUERY.IN - AUTHENTICATION CONTROLLER
 * =============================================================================
 * Handles user authentication and registration.
 *
 * LOGIN FLOW:
 * 1. Receive email + password from client (NO role from frontend - prevents spoofing)
 * 2. Find user by email in MongoDB
 * 3. Verify password using bcryptjs.compare()
 * 4. If valid, generate JWT with userId and server-resolved role
 * 5. Return token to client for stateless auth
 *
 * REGISTER FLOW:
 * 1. Receive email, password, and role from client
 * 2. Validate password strength (8+ chars, upper, lower, number, special)
 * 3. Hash password using bcryptjs.hash()
 * 4. Create new user document in MongoDB
 * 5. Return success response
 *
 * @module controllers/authController
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generates a JWT token with userId and role in payload.
 * The role is resolved from the database, NOT from the request body.
 *
 * @param {Object} user - Mongoose User document
 * @returns {String} Signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Validates password strength requirements.
 * Ensures: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
 *
 * @param {String} password - Plain text password
 * @returns {Boolean} True if password meets requirements
 */
const isValidPassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token.
 * Role is resolved server-side from database to prevent frontend spoofing.
 *
 * @async
 * @function login
 * @param {Object} req - Express request (body: { email, password })
 * @param {Object} res - Express response
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    if (user.is_disabled) {
      return res.status(403).json({
        success: false,
        error: 'Your account has been disabled. Contact an administrator.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during login',
      message: error.message,
    });
  }
};

/**
 * POST /api/auth/register
 * Creates a new user account with hashed password.
 * Password must meet security requirements.
 *
 * @async
 * @function register
 * @param {Object} req - Express request (body: { email, password, role })
 * @param {Object} res - Express response
 */
const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and role are required',
      });
    }

    const validRoles = ['admin', 'moderator', 'intern'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be one of: admin, moderator, intern',
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during registration',
      message: error.message,
    });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's data.
 * Requires valid JWT token.
 *
 * @async
 * @function getMe
 * @param {Object} req - Express request (req.user set by protect middleware)
 * @param {Object} res - Express response
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * POST /api/auth/bulk-register
 * Creates multiple user accounts in a single operation.
 * Only accessible by Admin users.
 *
 * @async
 * @function bulkRegister
 * @param {Object} req - Express request (body: { users: [{ email, password, role }] })
 * @param {Object} res - Express response
 */
const bulkRegister = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Users array is required',
      });
    }

    const createdUsers = [];
    const errors = [];

    for (const userData of users) {
      try {
        const { email, password, role } = userData;

        if (!email || !password || !role) {
          errors.push({ email, error: 'Missing required fields' });
          continue;
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          errors.push({ email, error: 'User already exists' });
          continue;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
        });

        await user.save();
        createdUsers.push({ email: user.email, role: user.role });
      } catch (err) {
        errors.push({ email: userData.email, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdUsers.length} users`,
      count: createdUsers.length,
      created: createdUsers,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during bulk registration',
      message: error.message,
    });
  }
};

/**
 * GET /api/auth/users
 * Returns all users in the system.
 * Only accessible by Admin users.
 *
 * @async
 * @function getAllUsers
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching users',
      message: error.message,
    });
  }
};

module.exports = { login, register, getMe, bulkRegister, getAllUsers };