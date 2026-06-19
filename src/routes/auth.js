/**
 * Tarea 2: Endpoints de autenticación.
 *
 * Implementa el cuerpo de cada ruta.
 * Los access tokens se generan con jsonwebtoken.
 * Los refresh tokens son strings aleatorios que se guardan en BD (hasheados).
 */
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middlewares/auth");
const {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
} = require("../db/tokens");
const User = require("../models/User");

const router = express.Router();

// TODO Tarea 4 — Rate limiting en login
// Aplica express-rate-limit solo a POST /auth/login.
// Máximo 5 intentos por IP en 15 minutos.
// Ejemplo de uso: router.post('/login', loginLimiter, async (req, res, next) => { ... })

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Demasiados intentos, inténtalo más tarde" },
});

/**
 * Genera un access token JWT de corta duración.
 * @param {object} user - documento de usuario (debe tener _id, email y role)
 * @returns {string}
 */
function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES },
  );
}

/**
 * Genera un refresh token aleatorio (texto plano).
 * Se hashea antes de guardarlo en BD.
 * @returns {string}
 */
function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken();

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await saveRefreshToken(user._id, refreshToken, expiresAt);

    res.json({ accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token requerido" });
    }

    const tokenDoc = await findRefreshToken(refreshToken);

    if (!tokenDoc) {
      return res.status(401).json({ error: "Refresh token inválido" });
    }

    if (tokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ error: "Refresh token expirado" });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token requerido" });
    }

    await deleteRefreshToken(refreshToken);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/logout-all", requireAuth, async (req, res, next) => {
  try {
    await deleteAllUserTokens(req.user.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
