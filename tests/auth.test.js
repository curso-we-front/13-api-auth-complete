const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

const TEST_DB = 'mongodb://localhost:27017/blog_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
});

// ─── Register ─────────────────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  it('crea un usuario y responde 201', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'pass1234',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email', 'alice@test.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('responde 400 si el email ya está registrado', async () => {
    await request(app).post('/auth/register').send({
      name: 'Alice',
      email: 'alice@test.com',
      password: 'pass1234',
    });

    const res = await request(app).post('/auth/register').send({
      name: 'Alice 2',
      email: 'alice@test.com',
      password: 'otrapass',
    });

    expect(res.status).toBe(400);
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/auth/register').send({
      name: 'Bob',
      email: 'bob@test.com',
      password: 'pass1234',
    });
  });

  it('devuelve accessToken, refreshToken y user', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'bob@test.com',
      password: 'pass1234',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('responde 401 con contraseña incorrecta', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'bob@test.com',
      password: 'wrong',
    });

    expect(res.status).toBe(401);
  });

  it('responde 401 con email inexistente', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'nobody@test.com',
      password: 'pass1234',
    });

    expect(res.status).toBe(401);
  });
});
