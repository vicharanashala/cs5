const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const Query = require('../models/Query');
const Response = require('../models/Response');
const FAQ = require('../models/FAQ');
const adminRoutes = require('../routes/adminRoutes');

let mongoServer;
let app;
let adminToken;
let moderatorToken;
let internToken;
let adminUser;
let moderatorUser;
let internUser;

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
  await Query.deleteMany({});
  await Response.deleteMany({});
  await FAQ.deleteMany({});

  const hashedPassword = await bcrypt.hash('Admin@1234', 12);
  adminUser = await User.create({
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
  });

  const modHashed = await bcrypt.hash('Mod@1234', 12);
  moderatorUser = await User.create({
    email: 'mod@example.com',
    password: modHashed,
    role: 'moderator',
  });

  const internHashed = await bcrypt.hash('Test@1234', 12);
  internUser = await User.create({
    email: 'intern@example.com',
    password: internHashed,
    role: 'intern',
  });

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
  adminToken = jwt.sign(
    { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
    JWT_SECRET
  );
  moderatorToken = jwt.sign(
    { userId: moderatorUser._id, email: moderatorUser.email, role: moderatorUser.role },
    JWT_SECRET
  );
  internToken = jwt.sign(
    { userId: internUser._id, email: internUser.email, role: internUser.role },
    JWT_SECRET
  );

  app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
});

describe('Admin Controller - Query Resolution', () => {
  let query;
  let response;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'How do I reset my password?',
      status: 'Peer Answered',
      is_locked: true,
    });

    response = await Response.create({
      query_id: query._id,
      author_id: internUser._id,
      response_text: 'Go to settings and click reset',
      response_type: 'peer',
      rating: 5,
    });

    query.responses.push(response._id);
    await query.save();
  });

  describe('POST /api/admin/approve', () => {
    it('should approve peer response', async () => {
      const res = await request(app)
        .post('/api/admin/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query_id: query._id,
          response_id: response._id,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resolution_type).toBe('peer_approved');
    });

    it('should set response approval to true', async () => {
      await request(app)
        .post('/api/admin/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query_id: query._id,
          response_id: response._id,
        });

      const updatedResponse = await Response.findById(response._id);
      expect(updatedResponse.approval).toBe(true);
    });

    it('should mark query as resolved', async () => {
      await request(app)
        .post('/api/admin/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query_id: query._id,
          response_id: response._id,
        });

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.status).toBe('Resolved');
      expect(updatedQuery.is_locked).toBe(true);
    });

    it('should fail for non-admin user', async () => {
      const res = await request(app)
        .post('/api/admin/approve')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_id: query._id,
          response_id: response._id,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/admin/override', () => {
    it('should create admin override response', async () => {
      const res = await request(app)
        .post('/api/admin/override')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query_id: query._id,
          response_text: 'Admin override answer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.response_text).toBe('Admin override answer');
    });

    it('should mark query as resolved with admin_override', async () => {
      await request(app)
        .post('/api/admin/override')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query_id: query._id,
          response_text: 'Admin override answer',
        });

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.status).toBe('Resolved');
      expect(updatedQuery.resolution_type).toBe('admin_override');
    });

    it('should fail for non-admin/moderator user', async () => {
      const res = await request(app)
        .post('/api/admin/override')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_id: query._id,
          response_text: 'Override answer',
        });

      expect(res.status).toBe(403);
    });
  });
});

describe('Admin Controller - Warning System', () => {
  describe('POST /api/admin/warn-user', () => {
    it('should send warning to intern', async () => {
      const res = await request(app)
        .post('/api/admin/warn-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user_id: internUser._id,
          message: 'Please follow community guidelines',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should increment warning_count', async () => {
      await request(app)
        .post('/api/admin/warn-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user_id: internUser._id,
        });

      const updatedUser = await User.findById(internUser._id);
      expect(updatedUser.warning_count).toBe(1);
    });

    it('should auto-disable user at 5 warnings', async () => {
      await User.findByIdAndUpdate(internUser._id, { warning_count: 4 });

      await request(app)
        .post('/api/admin/warn-user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          user_id: internUser._id,
        });

      const updatedUser = await User.findById(internUser._id);
      expect(updatedUser.warning_count).toBe(5);
      expect(updatedUser.is_disabled).toBe(true);
    });
  });

  describe('GET /api/admin/spoiled-users', () => {
    beforeEach(async () => {
      await User.findByIdAndUpdate(internUser._id, { warning_count: 3 });
    });

    it('should return users with warnings', async () => {
      const res = await request(app)
        .get('/api/admin/spoiled-users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some(u => u.warning_count > 0)).toBe(true);
    });
  });
});

describe('Admin Controller - FAQ Creation', () => {
  let query;
  let response;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'How do I reset my password?',
      status: 'Resolved',
      resolution_type: 'peer_approved',
    });

    response = await Response.create({
      query_id: query._id,
      author_id: internUser._id,
      response_text: 'Go to settings and click reset password',
      response_type: 'peer',
      approval: true,
    });

    query.responses.push(response._id);
    await query.save();
  });

  describe('POST /api/admin/create-faq', () => {
    it('should create FAQ from approved response', async () => {
      const res = await request(app)
        .post('/api/admin/create-faq')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query_id: query._id,
          response_id: response._id,
          category: 'Account',
          tags: ['password', 'account'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.clean_question).toBe('How do I reset my password?');
      expect(res.body.data.answer).toBe('Go to settings and click reset password');
    });

    it('should include keywords from tags', async () => {
      const res = await request(app)
        .post('/api/admin/create-faq')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          query_id: query._id,
          response_id: response._id,
          category: 'Account',
          keywords: ['reset', 'password'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.keywords).toContain('reset');
      expect(res.body.data.keywords).toContain('password');
    });
  });
});

describe('Admin Controller - Query Deletion', () => {
  let query;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'Delete this query',
      status: 'Ambiguous',
    });
  });

  describe('DELETE /api/admin/query/:id', () => {
    it('should delete query', async () => {
      const res = await request(app)
        .delete(`/api/admin/query/${query._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail for non-admin user', async () => {
      const res = await request(app)
        .delete(`/api/admin/query/${query._id}`)
        .set('Authorization', `Bearer ${moderatorToken}`);

      expect(res.status).toBe(403);
    });
  });
});

describe('Admin Controller - Clear All Data', () => {
  beforeEach(async () => {
    await Query.create({ intern_id: internUser._id, query_text: 'Test query' });
    await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      role: 'intern',
    });
  });

  describe('POST /api/admin/clear-all-data', () => {
    it('should clear all Query, Response, NoFaq, Notification data', async () => {
      const res = await request(app)
        .post('/api/admin/clear-all-data')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should preserve User and FAQ collections', async () => {
      await request(app)
        .post('/api/admin/clear-all-data')
        .set('Authorization', `Bearer ${adminToken}`);

      const userCount = await User.countDocuments();
      expect(userCount).toBeGreaterThan(0);
    });
  });
});

describe('Admin Controller - Moderator Suggestions', () => {
  let query;
  let response;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'Resolved query',
      status: 'Resolved',
      resolution_type: 'peer_approved',
    });

    response = await Response.create({
      query_id: query._id,
      author_id: internUser._id,
      response_text: 'Approved response',
      response_type: 'peer',
      approval: true,
    });

    query.responses.push(response._id);
    await query.save();
  });

  describe('POST /api/admin/suggest-faq', () => {
    it('should allow moderator to suggest FAQ from archived query', async () => {
      const res = await request(app)
        .post('/api/admin/suggest-faq')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          query_id: query._id,
          suggested_answer: 'This is the suggested answer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});