/**
 * Tarea 3: Middlewares de autorización por roles.
 */

/**
 * Verifica que req.user.role esté en la lista de roles permitidos.
 * Requiere que requireAuth haya corrido antes.
 *
 * Uso: router.delete('/x', requireAuth, authorize('admin', 'editor'), handler)
 *
 * @param {...string} roles
 * @returns {Function} middleware
 */
function authorize(...roles) {
  return (req, res, next) => {
    // TODO
  };
}

/**
 * Verifica que el recurso pertenece al usuario autenticado, o que es admin.
 *
 * @param {Model} Model - Modelo de Mongoose o función de query MySQL
 * @param {string} paramKey - Nombre del param en req.params (e.g. 'id')
 * @returns {Function} middleware async
 */
function isOwnerOrAdmin(Model, paramKey = 'id') {
  return async (req, res, next) => {
    // TODO
    // 1. Busca el recurso por req.params[paramKey]
    // 2. Si no existe → 404
    // 3. Si req.user.role === 'admin' → next()
    // 4. Si resource.userId o resource.authorId !== req.user.id → 403
    // 5. Si es el dueño → next()
  };
}

module.exports = { authorize, isOwnerOrAdmin };
