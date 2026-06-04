const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const FAQ = require('../models/FAQ');
const Query = require('../models/Query');
const askAIRoutes = require('../routes/askAIRoutes');

let mongoServer;
let app;
let internToken;
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
  await FAQ.deleteMany({});
  await Query.deleteMany({});

  const hashedPassword = await bcrypt.hash('Test@1234', 12);
  internUser = await User.create({
    email: 'intern@example.com',
    password: hashedPassword,
    role: 'intern',
  });

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
  internToken = jwt.sign(
    { userId: internUser._id, email: internUser.email, role: internUser.role },
    JWT_SECRET
  );

  app = express();
  app.use(express.json());
  app.use('/api/ask', askAIRoutes);
});

describe('Ask AI Controller - Autocomplete', () => {
  beforeEach(async () => {
    await FAQ.create([
      {
        clean_question: 'How do I reset my password?',
        answer: 'Go to settings and click reset password',
        category: 'Account',
        search_text: 'reset password',
        keywords: ['reset', 'password'],
        tags: ['account'],
      },
      {
        clean_question: 'How do I change my email?',
        answer: 'Go to settings and click change email',
        category: 'Account',
        search_text: 'change email',
        keywords: ['change', 'email'],
        tags: ['account'],
      },
      {
        clean_question: 'What is the vacation policy?',
        answer: 'You get 15 days of vacation per year',
        category: 'HR',
        search_text: 'vacation policy',
        keywords: ['vacation', 'policy'],
        tags: ['hr'],
      },
    ]);
  });

  describe('GET /api/ask/autocomplete', () => {
    it('should return matching FAQs for valid query', async () => {
      const res = await request(app)
        .get('/api/ask/autocomplete')
        .query({ q: 'password' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty for no matches', async () => {
      const res = await request(app)
        .get('/api/ask/autocomplete')
        .query({ q: 'nonexistentquery123' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('should limit to 5 results', async () => {
      for (let i = 0; i < 10; i++) {
        await FAQ.create({
          clean_question: `Test question ${i}`,
          answer: `Test answer ${i}`,
          category: 'Test',
          search_text: `test keyword ${i}`,
          keywords: [`keyword${i}`],
        });
      }

      const res = await request(app)
        .get('/api/ask/autocomplete')
        .query({ q: 'test' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should search across clean_question, search_text, tags, keywords', async () => {
      const res = await request(app)
        .get('/api/ask/autocomplete')
        .query({ q: 'reset' });

      expect(res.status).toBe(200);
      expect(res.body.data.some(faq => 
        faq.clean_question.toLowerCase().includes('reset') ||
        faq.search_text.toLowerCase().includes('reset') ||
        faq.tags.includes('reset')
      )).toBe(true);
    });
  });
});

describe('Ask AI Controller - Query Validation', () => {
  describe('POST /api/ask', () => {
    it('should reject query with less than 4 letters', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'abc',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_QUERY');
    });

    it('should reject query with too many special characters', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: '!!!@@@###$$$%%%^^^&&&',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_QUERY');
    });

    it('should reject query with 3+ repeated characters', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'aaaaaa',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_QUERY');
    });

    it('should reject garbage input', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'ajflafjllafffaafas',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_QUERY');
    });

    it('should reject empty query', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: '',
        });

      expect(res.status).toBe(400);
    });

    it('should reject query without authentication', async () => {
      const res = await request(app)
        .post('/api/ask')
        .send({
          query_text: 'How do I reset my password?',
        });

      expect(res.status).toBe(401);
    });
  });
});

describe('Ask AI Controller - RAG Search', () => {
  beforeEach(async () => {
    await FAQ.create({
      clean_question: 'How do I reset my password?',
      answer: 'Go to settings and click reset password',
      category: 'Account',
      search_text: 'reset password',
      keywords: ['reset', 'password'],
      tags: ['account'],
      priority: 5,
    });
  });

  describe('POST /api/ask', () => {
    it('should return RAG match for matching query', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'How do I reset my password?',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.source).toBe('rag');
      expect(res.body.data.answer).toBeDefined();
    });

    it('should upvote RAG answer', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'How do I reset my password?',
          action: 'rag_upvote',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.resolution).toBe('resolved');
    });

    it('should trigger LLM on RAG downvote', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'How do I reset my password?',
          action: 'rag_downvote',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.source).toBe('llm');
    });
  });
});

describe('Ask AI Controller - Active Query Cap', () => {
  beforeEach(async () => {
    for (let i = 0; i < 5; i++) {
      await Query.create({
        intern_id: internUser._id,
        query_text: `Query ${i}`,
        status: 'Pending',
      });
    }
  });

  describe('POST /api/ask', () => {
    it('should block escalation when 5 active queries reached', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'This should be blocked due to cap',
          action: 'grok_downvote',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('5 unresolved queries');
    });
  });
});

describe('Ask AI Controller - Similar Query Detection', () => {
  beforeEach(async () => {
    await Query.create({
      intern_id: internUser._id,
      query_text: 'How do I reset my password?',
      status: 'Pending',
    });
  });

  describe('POST /api/ask', () => {
    it('should block similar query spam', async () => {
      const res = await request(app)
        .post('/api/ask')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'How do I reset my password?',
          action: 'grok_downvote',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SPAM_BLOCKED');
    });
  });
});