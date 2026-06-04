const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const Query = require('../models/Query');
const Response = require('../models/Response');
const peerRoutes = require('../routes/peerRoutes');

let mongoServer;
let app;
let internToken;
let peerToken;
let internUser;
let peerUser;

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

  const hashedPassword = await bcrypt.hash('Test@1234', 12);
  internUser = await User.create({
    email: 'intern@example.com',
    password: hashedPassword,
    role: 'intern',
  });

  peerUser = await User.create({
    email: 'peer@example.com',
    password: hashedPassword,
    role: 'intern',
  });

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
  internToken = jwt.sign(
    { userId: internUser._id, email: internUser.email, role: internUser.role },
    JWT_SECRET
  );
  peerToken = jwt.sign(
    { userId: peerUser._id, email: peerUser.email, role: peerUser.role },
    JWT_SECRET
  );

  app = express();
  app.use(express.json());
  app.use('/api/peer', peerRoutes);
});

describe('Peer Controller - Query Submission', () => {
  describe('POST /api/peer/submit (via queryRoutes)', () => {
    it('should create a new query when LLM fails', async () => {
      const res = await request(app)
        .post('/api/queries')
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          query_text: 'How do I reset my password?',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.intern_id.toString()).toBe(internUser._id.toString());
      expect(res.body.data.status).toBe('Pending');
    });
  });
});

describe('Peer Controller - Answer Submission', () => {
  let query;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'How do I reset my password?',
      status: 'Pending',
    });
  });

  describe('POST /api/peer/answer', () => {
    it('should submit an answer to a query', async () => {
      const res = await request(app)
        .post('/api/peer/answer')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: query._id,
          response_text: 'Go to settings and click reset password',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.response_text).toBe('Go to settings and click reset password');
    });

    it('should change status to Peer Answered', async () => {
      await request(app)
        .post('/api/peer/answer')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: query._id,
          response_text: 'Go to settings and click reset password',
        });

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.status).toBe('Peer Answered');
    });

    it('should fail for non-existent query', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/peer/answer')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: fakeId,
          response_text: 'Some answer',
        });

      expect(res.status).toBe(404);
    });

    it('should fail with empty response text', async () => {
      const res = await request(app)
        .post('/api/peer/answer')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: query._id,
          response_text: '',
        });

      expect(res.status).toBe(400);
    });

    it('should accept peer_note (internal note)', async () => {
      const res = await request(app)
        .post('/api/peer/answer')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: query._id,
          response_text: 'Go to settings and click reset password',
          peer_note: 'This is an internal note for admins',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.peer_note).toBe('This is an internal note for admins');
    });
  });
});

describe('Peer Controller - Rating', () => {
  let query;
  let response;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'How do I reset my password?',
      status: 'Peer Answered',
    });

    response = await Response.create({
      query_id: query._id,
      author_id: peerUser._id,
      response_text: 'Go to settings and click reset password',
      response_type: 'peer',
    });

    query.responses.push(response._id);
    await query.save();
  });

  describe('POST /api/ratings/:id', () => {
    it('should rate a response', async () => {
      const res = await request(app)
        .post(`/api/ratings/${response._id}`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          rating: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
    });

    it('should lock query on 5-star rating', async () => {
      await request(app)
        .post(`/api/ratings/${response._id}`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          rating: 5,
        });

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.is_locked).toBe(true);
    });

    it('should lock query when 5 responses all rated 1-3 stars', async () => {
      const responses = [];
      for (let i = 0; i < 4; i++) {
        const tempUser = await User.create({
          email: `peer${i}@example.com`,
          password: await bcrypt.hash('Test@1234', 12),
          role: 'intern',
        });
        const r = await Response.create({
          query_id: query._id,
          author_id: tempUser._id,
          response_text: `Answer ${i}`,
          response_type: 'peer',
          rating: 2,
        });
        responses.push(r);
        query.responses.push(r._id);
      }
      await query.save();

      const res = await request(app)
        .post(`/api/ratings/${response._id}`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          rating: 2,
        });

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.is_locked).toBe(true);
    });

    it('should fail with invalid rating', async () => {
      const res = await request(app)
        .post(`/api/ratings/${response._id}`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          rating: 6,
        });

      expect(res.status).toBe(400);
    });

    it('should include optional rater_note', async () => {
      const res = await request(app)
        .post(`/api/ratings/${response._id}`)
        .set('Authorization', `Bearer ${internToken}`)
        .send({
          rating: 4,
          rater_note: 'Good answer but could be more detailed',
        });

      expect(res.status).toBe(200);
      const updatedResponse = await Response.findById(response._id);
      expect(updatedResponse.rater_note).toBe('Good answer but could be more detailed');
    });
  });
});

describe('Peer Controller - Skip Query', () => {
  let query;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'How do I reset my password?',
      status: 'Pending',
    });
  });

  describe('POST /api/peer/skip', () => {
    it('should skip a query', async () => {
      const res = await request(app)
        .post('/api/peer/skip')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: query._id,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should add user to skipped_by array', async () => {
      await request(app)
        .post('/api/peer/skip')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: query._id,
        });

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.skipped_by).toContainEqual(peerUser._id);
    });
  });
});

describe('Peer Controller - Mark Ambiguous', () => {
  let query;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'How do I reset my password?',
      status: 'Pending',
    });
  });

  describe('POST /api/peer/ambiguous', () => {
    it('should mark query as ambiguous after 3 strikes', async () => {
      const users = [];
      for (let i = 0; i < 3; i++) {
        const tempUser = await User.create({
          email: `peer${i}@example.com`,
          password: await bcrypt.hash('Test@1234', 12),
          role: 'intern',
        });
        users.push(tempUser);
      }

      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

      for (const user of users) {
        const token = jwt.sign(
          { userId: user._id, email: user.email, role: user.role },
          JWT_SECRET
        );
        await request(app)
          .post('/api/peer/ambiguous')
          .set('Authorization', `Bearer ${token}`)
          .send({
            query_id: query._id,
          });
      }

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.status).toBe('Ambiguous');
      expect(updatedQuery.is_locked).toBe(true);
    });

    it('should increment ambiguous_count', async () => {
      const tempUser = await User.create({
        email: 'peer0@example.com',
        password: await bcrypt.hash('Test@1234', 12),
        role: 'intern',
      });

      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
      const token = jwt.sign(
        { userId: tempUser._id, email: tempUser.email, role: tempUser.role },
        JWT_SECRET
      );

      await request(app)
        .post('/api/peer/ambiguous')
        .set('Authorization', `Bearer ${token}`)
        .send({
          query_id: query._id,
        });

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.ambiguous_count).toBe(1);
    });

    it('should prevent same user from marking twice', async () => {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

      await request(app)
        .post('/api/peer/ambiguous')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: query._id,
        });

      await request(app)
        .post('/api/peer/ambiguous')
        .set('Authorization', `Bearer ${peerToken}`)
        .send({
          query_id: query._id,
        });

      const updatedQuery = await Query.findById(query._id);
      expect(updatedQuery.ambiguous_count).toBe(1);
    });
  });
});

describe('Peer Controller - Get My Escalations', () => {
  beforeEach(async () => {
    await Query.create([
      { intern_id: internUser._id, query_text: 'Query 1', status: 'Pending' },
      { intern_id: internUser._id, query_text: 'Query 2', status: 'Resolved' },
      { intern_id: peerUser._id, query_text: 'Other query', status: 'Pending' },
    ]);
  });

  describe('GET /api/peer/my-escalations', () => {
    it('should return only current user queries', async () => {
      const res = await request(app)
        .get('/api/peer/my-escalations')
        .set('Authorization', `Bearer ${internToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });
});

describe('Peer Controller - Delete Escalation', () => {
  let query;

  beforeEach(async () => {
    query = await Query.create({
      intern_id: internUser._id,
      query_text: 'My query',
      status: 'Pending',
    });
  });

  describe('DELETE /api/peer/:query_id', () => {
    it('should delete own escalation', async () => {
      const res = await request(app)
        .delete(`/api/peer/${query._id}`)
        .set('Authorization', `Bearer ${internToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail to delete others query', async () => {
      const res = await request(app)
        .delete(`/api/peer/${query._id}`)
        .set('Authorization', `Bearer ${peerToken}`);

      expect(res.status).toBe(403);
    });
  });
});