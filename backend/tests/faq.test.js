const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const FAQ = require('../models/FAQ');
const User = require('../models/User');
const faqRoutes = require('../routes/faqRoutes');

let mongoServer;
let app;
let adminToken;
let internToken;
let adminUser;
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
  await FAQ.deleteMany({});
  await User.deleteMany({});

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
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
  adminToken = jwt.sign(
    { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
    JWT_SECRET
  );
  internToken = jwt.sign(
    { userId: internUser._id, email: internUser.email, role: internUser.role },
    JWT_SECRET
  );

  app = express();
  app.use(express.json());
  app.use('/api/faqs', faqRoutes);
});

describe('FAQ Controller', () => {
  describe('GET /api/faqs', () => {
    beforeEach(async () => {
      await FAQ.create([
        {
          clean_question: 'What is Node.js?',
          answer: 'Node.js is a JavaScript runtime',
          category: 'Programming',
          search_text: 'nodejs javascript runtime',
          keywords: ['node', 'javascript'],
          tags: ['programming', 'javascript'],
        },
        {
          clean_question: 'What is React?',
          answer: 'React is a JavaScript library for building UIs',
          category: 'Programming',
          search_text: 'react javascript library',
          keywords: ['react', 'ui'],
          tags: ['programming', 'frontend'],
        },
      ]);
    });

    it('should return all FAQs', async () => {
      const res = await request(app).get('/api/faqs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should return FAQs sorted by priority', async () => {
      await FAQ.create({
        clean_question: 'Important FAQ',
        answer: 'Important answer',
        category: 'Programming',
        search_text: 'important',
        priority: 10,
      });

      const res = await request(app).get('/api/faqs');

      expect(res.status).toBe(200);
      expect(res.body.data[0].priority).toBe(10);
    });
  });

  describe('GET /api/faqs/search', () => {
    beforeEach(async () => {
      await FAQ.create({
        clean_question: 'What is Node.js?',
        answer: 'Node.js is a JavaScript runtime',
        category: 'Programming',
        search_text: 'nodejs javascript runtime',
        keywords: ['node', 'javascript'],
      });
    });

    it('should search FAQs by keyword', async () => {
      const res = await request(app)
        .get('/api/faqs/search')
        .query({ q: 'node' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty for no matches', async () => {
      const res = await request(app)
        .get('/api/faqs/search')
        .query({ q: 'nonexistent' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('POST /api/faqs', () => {
    it('should create FAQ for admin', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clean_question: 'What is MongoDB?',
          answer: 'MongoDB is a NoSQL database',
          category: 'Database',
          search_text: 'mongodb database nosql',
          keywords: ['mongo', 'database'],
          tags: ['database'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.clean_question).toBe('What is MongoDB?');
    });

    it('should fail for non-admin user', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          clean_question: 'What is MongoDB?',
          answer: 'MongoDB is a NoSQL database',
          category: 'Database',
          search_text: 'mongodb database nosql',
        });

      expect(res.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .send({
          clean_question: 'What is MongoDB?',
          answer: 'MongoDB is a NoSQL database',
          category: 'Database',
          search_text: 'mongodb database nosql',
        });

      expect(res.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const res = await request(app)
        .post('/api/faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clean_question: 'What is MongoDB?',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/faqs/:id', () => {
    let faq;

    beforeEach(async () => {
      faq = await FAQ.create({
        clean_question: 'What is Node.js?',
        answer: 'Node.js is a JavaScript runtime',
        category: 'Programming',
        search_text: 'nodejs javascript runtime',
        keywords: ['node', 'javascript'],
      });
    });

    it('should update FAQ for admin', async () => {
      const res = await request(app)
        .put(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clean_question: 'What is Node.js? Updated',
          answer: 'Updated answer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.clean_question).toBe('What is Node.js? Updated');
    });

    it('should fail for non-admin user', async () => {
      const res = await request(app)
        .put(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          clean_question: 'Updated question',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/faqs/:id', () => {
    let faq;

    beforeEach(async () => {
      faq = await FAQ.create({
        clean_question: 'What is Node.js?',
        answer: 'Node.js is a JavaScript runtime',
        category: 'Programming',
        search_text: 'nodejs javascript runtime',
        keywords: ['node', 'javascript'],
      });
    });

    it('should delete FAQ for admin', async () => {
      const res = await request(app)
        .delete(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const deletedFaq = await FAQ.findById(faq._id);
      expect(deletedFaq).toBeNull();
    });

    it('should fail for non-admin user', async () => {
      const res = await request(app)
        .delete(`/api/faqs/${faq._id}`)
        .set('Authorization', `Bearer ${internToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/faqs/categories', () => {
    beforeEach(async () => {
      await FAQ.create([
        { clean_question: 'Q1', answer: 'A1', category: 'Programming', search_text: 'q1' },
        { clean_question: 'Q2', answer: 'A2', category: 'Programming', search_text: 'q2' },
        { clean_question: 'Q3', answer: 'A3', category: 'Database', search_text: 'q3' },
      ]);
    });

    it('should return unique categories', async () => {
      const res = await request(app).get('/api/faqs/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toContain('Programming');
      expect(res.body.data).toContain('Database');
    });
  });
});