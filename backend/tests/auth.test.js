const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const { protect } = require('../middleware/authMiddleware');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  
  app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
});

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          role: 'intern',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.role).toBe('intern');
      expect(res.body.token).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test@1234',
          role: 'intern',
        });

      expect(res.status).toBe(500);
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          role: 'intern',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must be');
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          role: 'intern',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          role: 'intern',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    it('should fail with invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          role: 'invalid',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 12);
      await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        role: 'intern',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Wrong@1234',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('should fail for disabled user', async () => {
      await User.findOneAndUpdate(
        { email: 'test@example.com' },
        { is_disabled: true }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('disabled');
    });

    it('should fail for inactive user', async () => {
      await User.findOneAndUpdate(
        { email: 'test@example.com' },
        { isActive: false }
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('deactivated');
    });
  });

  describe('GET /api/auth/me', () => {
    let user;
    let token;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 12);
      user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        role: 'intern',
      });

      const jwt = require('jsonwebtoken');
      token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'dev-secret-key'
      );
    });

    it('should return current user data', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.password).toBeUndefined();
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/users', () => {
    let adminUser;
    let adminToken;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Admin@1234', 12);
      adminUser = await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      const jwt = require('jsonwebtoken');
      adminToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'dev-secret-key'
      );
    });

    it('should return all users for admin', async () => {
      await User.create({
        email: 'intern@example.com',
        password: hashedPassword,
        role: 'intern',
      });

      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });

    it('should fail for non-admin user', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 12);
      const internUser = await User.create({
        email: 'intern@example.com',
        password: hashedPassword,
        role: 'intern',
      });

      const jwt = require('jsonwebtoken');
      const internToken = jwt.sign(
        { userId: internUser._id, email: internUser.email, role: internUser.role },
        process.env.JWT_SECRET || 'dev-secret-key'
      );

      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${internToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/auth/users/:id/toggle-status', () => {
    let adminUser;
    let adminToken;
    let internUser;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Admin@1234', 12);
      adminUser = await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      const internHashed = await bcrypt.hash('Test@1234', 12);
      internUser = await User.create({
        email: 'intern@example.com',
        password: internHashed,
        role: 'intern',
      });

      const jwt = require('jsonwebtoken');
      adminToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'dev-secret-key'
      );
    });

    it('should toggle user status', async () => {
      const res = await request(app)
        .patch(`/api/auth/users/${internUser._id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should fail when admin tries to toggle self', async () => {
      const res = await request(app)
        .patch(`/api/auth/users/${adminUser._id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('cannot change your own');
    });

    it('should fail when toggling admin user', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 12);
      const anotherAdmin = await User.create({
        email: 'anotheradmin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      const res = await request(app)
        .patch(`/api/auth/users/${anotherAdmin._id}/toggle-status`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Cannot change status of an admin');
    });
  });

  describe('PATCH /api/auth/users/:id/remove-warnings', () => {
    let adminUser;
    let adminToken;
    let internUser;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Admin@1234', 12);
      adminUser = await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      const internHashed = await bcrypt.hash('Test@1234', 12);
      internUser = await User.create({
        email: 'intern@example.com',
        password: internHashed,
        role: 'intern',
        warning_count: 3,
      });

      const jwt = require('jsonwebtoken');
      adminToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'dev-secret-key'
      );
    });

    it('should remove warnings from user', async () => {
      const res = await request(app)
        .patch(`/api/auth/users/${internUser._id}/remove-warnings`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.warning_count).toBe(0);
    });

    it('should re-enable disabled user', async () => {
      await User.findByIdAndUpdate(internUser._id, { is_disabled: true });

      const res = await request(app)
        .patch(`/api/auth/users/${internUser._id}/remove-warnings`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const updatedUser = await User.findById(internUser._id);
      expect(updatedUser.is_disabled).toBe(false);
    });
  });

  describe('DELETE /api/auth/users/:id', () => {
    let adminUser;
    let adminToken;
    let internUser;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Admin@1234', 12);
      adminUser = await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      const internHashed = await bcrypt.hash('Test@1234', 12);
      internUser = await User.create({
        email: 'intern@example.com',
        password: internHashed,
        role: 'intern',
      });

      const jwt = require('jsonwebtoken');
      adminToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'dev-secret-key'
      );
    });

    it('should delete user', async () => {
      const res = await request(app)
        .delete(`/api/auth/users/${internUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const deletedUser = await User.findById(internUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should fail when admin tries to delete self', async () => {
      const res = await request(app)
        .delete(`/api/auth/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('cannot delete your own');
    });

    it('should fail when deleting admin user', async () => {
      const hashedPassword = await bcrypt.hash('Test@1234', 12);
      const anotherAdmin = await User.create({
        email: 'anotheradmin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      const res = await request(app)
        .delete(`/api/auth/users/${anotherAdmin._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Cannot delete an admin');
    });
  });
});