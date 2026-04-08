/**
 * Tarea 1: Almacenamiento de refresh tokens en MongoDB.
 *
 * Los tokens se guardan HASHEADOS (nunca en texto plano).
 * Usa crypto.createHash('sha256') para hashear antes de guardar o buscar.
 */
const mongoose = require('mongoose');
const crypto = require('crypto');

// ─── Schema ──────────────────────────────────────────────────────────────────

const refreshTokenSchema = new mongoose.Schema({
  // TODO: define los campos necesarios.
  // Pista: necesitas almacenar el hash del token, el userId y la fecha de expiración.
  //
  // Ejemplo de campos:
  //   tokenHash : String  (el token hasheado)
  //   userId    : mongoose.Schema.Types.ObjectId  (referencia al usuario)
  //   expiresAt : Date
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Hashea un token con SHA-256.
 * Úsalo siempre antes de guardar o buscar un token.
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ─── Funciones de acceso a BD ─────────────────────────────────────────────────

/**
 * Guarda un refresh token hasheado en la base de datos.
 * @param {string} userId
 * @param {string} token     - token en texto plano (hashéalo aquí con hashToken)
 * @param {Date}   expiresAt
 */
async function saveRefreshToken(userId, token, expiresAt) {
  // TODO
}

/**
 * Busca un refresh token por su valor en texto plano.
 * Devuelve el documento o null si no existe o ya expiró.
 * @param {string} token
 * @returns {Promise<object|null>}
 */
async function findRefreshToken(token) {
  // TODO
}

/**
 * Elimina un refresh token de la base de datos.
 * @param {string} token
 */
async function deleteRefreshToken(token) {
  // TODO
}

/**
 * Elimina TODOS los refresh tokens de un usuario.
 * Se usa en POST /auth/logout-all.
 * @param {string} userId
 */
async function deleteAllUserTokens(userId) {
  // TODO
}

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserTokens,
};
