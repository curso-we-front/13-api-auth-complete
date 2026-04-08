/**
 * Tarea 2: Endpoints de autenticación.
 *
 * Implementa el cuerpo de cada ruta.
 * Los access tokens se generan con jsonwebtoken.
 * Los refresh tokens son strings aleatorios que se guardan en BD (hasheados).
 */
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { requireAuth } = require('../middlewares/auth');
const {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
} = require('../db/tokens');
const User = require('../models/User');

const router = express.Router();

// TODO Tarea 4 — Rate limiting en login
// Aplica express-rate-limit solo a POST /auth/login.
// Máximo 5 intentos por IP en 15 minutos.
// Ejemplo de uso: router.post('/login', loginLimiter, async (req, res, next) => { ... })

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Genera un access token JWT de corta duración.
 * @param {object} user - documento de usuario (debe tener _id, email y role)
 * @returns {string}
 */
function generateAccessToken(user) {
  // TODO: firma un JWT con { id: user._id, email: user.email, role: user.role }
  // Usa JWT_ACCESS_SECRET y JWT_ACCESS_EXPIRES del .env
}

/**
 * Genera un refresh token aleatorio (texto plano).
 * Se hashea antes de guardarlo en BD.
 * @returns {string}
 */
function generateRefreshToken() {
  // TODO: devuelve crypto.randomBytes(40).toString('hex')
}

// ─── Rutas ────────────────────────────────────────────────────────────────────

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    // TODO
    // 1. Extrae name, email y password de req.body
    // 2. Crea el usuario con User.create(...)
    //    (el modelo hashea la contraseña automáticamente en el pre-save hook)
    // 3. Responde con status 201 y el usuario (sin password gracias a toJSON)
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    // TODO
    // 1. Busca el usuario por email con User.findOne(...)
    // 2. Si no existe o la contraseña es incorrecta → 401
    //    Usa user.comparePassword(password) para verificar
    // 3. Genera accessToken con generateAccessToken(user)
    // 4. Genera refreshToken con generateRefreshToken()
    // 5. Guarda el refreshToken en BD:
    //      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    //      saveRefreshToken(user._id, refreshToken, expiresAt)
    // 6. Responde con { accessToken, refreshToken, user }
  } catch (err) {
    next(err);
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    // TODO
    // 1. Extrae refreshToken de req.body
    // 2. Búscalo en BD con findRefreshToken(refreshToken)
    // 3. Si no existe → 401 { error: 'Refresh token inválido' }
    // 4. Comprueba que no ha expirado (tokenDoc.expiresAt < new Date()) → 401
    // 5. Carga el usuario con User.findById(tokenDoc.userId)
    // 6. Genera un nuevo accessToken con generateAccessToken(user)
    // 7. Responde con { accessToken }
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    // TODO
    // 1. Extrae refreshToken de req.body
    // 2. Elimínalo de la BD con deleteRefreshToken(refreshToken)
    // 3. Responde con status 204 (sin cuerpo)
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout-all  (requiere estar autenticado)
router.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    // TODO
    // 1. Usa req.user.id para eliminar todos los tokens del usuario
    //      deleteAllUserTokens(req.user.id)
    // 2. Responde con status 204 (sin cuerpo)
  } catch (err) {
    next(err);
  }
});

module.exports = router;
