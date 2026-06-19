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
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "No tienes permisos suficientes" });
    }

    next();
  };
}

/**
 * Verifica que el recurso pertenece al usuario autenticado, o que es admin.
 *
 * @param {Model} Model - Modelo de Mongoose o función de query MySQL
 * @param {string} paramKey - Nombre del param en req.params (e.g. 'id')
 * @returns {Function} middleware async
 */
function isOwnerOrAdmin(Model, paramKey = "id") {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[paramKey]);

      if (!resource) {
        return res.status(404).json({ error: "Recurso no encontrado" });
      }

      if (req.user.role === "admin") {
        return next();
      }

      const ownerId =
        resource.userId?.toString() || resource.authorId?.toString();

      if (!ownerId || ownerId !== req.user.id) {
        return res.status(403).json({ error: "No autorizado" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: "Error del servidor" });
    }
  };
}

module.exports = { authorize, isOwnerOrAdmin };
