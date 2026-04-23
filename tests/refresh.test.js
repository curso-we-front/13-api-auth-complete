const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

const TEST_DB = 'mongodb://localhost:27017/blog_test';

let refreshToken;
let accessToken;

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

  await request(app).post('/auth/register').send({
    name: 'Carol',
    email: 'carol@test.com',
    password: 'pass1234',
  });

  const res = await request(app).post('/auth/login').send({
    email: 'carol@test.com',
    password: 'pass1234',
  });

  accessToken = res.body.accessToken;
  refreshToken = res.body.refreshToken;
});

// ─── Refresh ──────────────────────────────────────────────────────────────────

describe('POST /auth/refresh', () => {
  it('devuelve un nuevo accessToken con refresh token válido', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('responde 401 con refresh token inválido', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'token-falso' });

    expect(res.status).toBe(401);
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

describe('POST /auth/logout', () => {
  it('invalida el refresh token (no se puede volver a usar)', async () => {
    await request(app).post('/auth/logout').send({ refreshToken });

    const res = await request(app).post('/auth/refresh').send({ refreshToken });

    expect(res.status).toBe(401);
  });

  it('responde 204', async () => {
    const res = await request(app).post('/auth/logout').send({ refreshToken });

    expect(res.status).toBe(204);
  });
});

// ─── Hashing ──────────────────────────────────────────────────────────────────

describe('Seguridad: hashing de refresh tokens', () => {
  it('no almacena el refresh token en texto plano en la BD', async () => {
    const RefreshToken = mongoose.model('RefreshToken');
    const docs = await RefreshToken.find({});
    expect(docs.length).toBeGreaterThan(0);
    const stored = JSON.stringify(docs[0].toJSON());
    expect(stored).not.toContain(refreshToken);
  });
});

// ─── Logout-all ───────────────────────────────────────────────────────────────

describe('POST /auth/logout-all', () => {
  it('responde 401 sin access token', async () => {
    const res = await request(app).post('/auth/logout-all');

    expect(res.status).toBe(401);
  });

  it('invalida todos los tokens del usuario', async () => {
    // Crea un segundo token iniciando sesión desde otro "dispositivo"
    const secondLogin = await request(app).post('/auth/login').send({
      email: 'carol@test.com',
      password: 'pass1234',
    });
    const secondRefreshToken = secondLogin.body.refreshToken;

    // Hace logout-all con el access token original
    await request(app)
      .post('/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`);

    // Ambos refresh tokens deben ser inválidos ahora
    const res1 = await request(app).post('/auth/refresh').send({ refreshToken });
    const res2 = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: secondRefreshToken });

    expect(res1.status).toBe(401);
    expect(res2.status).toBe(401);
  });
});
