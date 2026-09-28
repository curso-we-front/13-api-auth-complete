require("dotenv").config()
const express = require("express")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { requireAuth } = require("../middlewares/auth")
const {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
} = require("../db/tokens")
const User = require("../models/User")
const { default: rateLimit } = require("express-rate-limit")

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: "Too many requests, try again later" },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateAccessToken(user) {
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET
  const jwtAccessExpires = process.env.JWT_ACCESS_EXPIRES

  return jwt.sign({ id: user._id, email: user.email, role: user.role }, jwtAccessSecret, {
    expiresIn: jwtAccessExpires,
  })
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex")
}

// ─── Rutas ────────────────────────────────────────────────────────────────────

// POST /auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const user = await User.create({
      name,
      email,
      password,
    })
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
})

// POST /auth/login
router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await saveRefreshToken(user._id, refreshToken, expiresAt)
    res.status(200).json({ accessToken, refreshToken, user })
  } catch (err) {
    next(err)
  }
})

// POST /auth/refresh
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    const tokenDoc = await findRefreshToken(refreshToken)
    if (!tokenDoc) {
      return res.status(401).json({ error: "Refresh token invalid" })
    }
    const isExpiredToken = tokenDoc.expiresAt < new Date()
    if (isExpiredToken) {
      return res.status(401).json({ error: "Refresh token expired" })
    }
    const user = await User.findById(tokenDoc.userId)
    if (!user) {
      return res.status(401).json({ error: "User does not exist" })
    }
    const accessToken = generateAccessToken(user)
    res.status(200).json({ accessToken })
  } catch (err) {
    next(err)
  }
})

// POST /auth/logout
router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    await deleteRefreshToken(refreshToken)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// POST /auth/logout-all  (requiere estar autenticado)
router.post("/logout-all", requireAuth, async (req, res, next) => {
  try {
    await deleteAllUserTokens(req.user.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

module.exports = router
