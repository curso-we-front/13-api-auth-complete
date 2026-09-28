const mongoose = require("mongoose")
const crypto = require("crypto")

// ─── Schema ──────────────────────────────────────────────────────────────────

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
})

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

// ─── Funciones de acceso a BD ─────────────────────────────────────────────────

async function saveRefreshToken(userId, token, expiresAt) {
  const refreshHashToken = hashToken(token)
  const refreshToken = await RefreshToken.create({
    tokenHash: refreshHashToken,
    userId,
    expiresAt,
  })
  return refreshToken
}
async function findRefreshToken(token) {
  const hashedToken = hashToken(token)
  const documentToken = await RefreshToken.findOne({ tokenHash: hashedToken })
  if (!documentToken || documentToken.expiresAt < Date.now()) {
    return null
  }
  return documentToken
}

async function deleteRefreshToken(token) {
  const hashedToken = hashToken(token)
  await RefreshToken.deleteOne({ tokenHash: hashedToken })
}

async function deleteAllUserTokens(userId) {
  await RefreshToken.deleteMany({ userId })
}

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
}
