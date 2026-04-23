const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

const TEST_DB = 'mongodb://localhost:27017/blog_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }
  await User.deleteMany({});
  await request(app).post('/auth/register').send({
    name: 'Dave',
    email: 'dave@test.com',
    password: 'pass1234',
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// ─── Rate limiting en login ───────────────────────────────────────────────────

describe('Rate limiting en POST /auth/login', () => {
  it('responde 429 tras 5 intentos fallidos de login consecutivos', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/auth/login').send({
        email: 'dave@test.com',
        password: 'wrong',
      });
    }

    const res = await request(app).post('/auth/login').send({
      email: 'dave@test.com',
      password: 'wrong',
    });

    expect(res.status).toBe(429);
  });

  it('el 429 incluye un mensaje de error', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'dave@test.com',
      password: 'wrong',
    });

    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty('error');
  });
});
