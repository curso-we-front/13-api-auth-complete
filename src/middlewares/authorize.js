function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: "Access denied" })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "User without permission" })
    }
    next()
  }
}

function isOwnerOrAdmin(Model, paramKey = "id") {
  return async (req, res, next) => {
    const resource = await Model.findById(req.params[paramKey])
    if (!resource) {
      return res.status(404).json({ error: "Resource does not exist" })
    }
    if (req.user.role === "admin") {
      return next()
    }
    const ownerId = resource.userId?.toString() || resource.authorId?.toString()
    if (ownerId !== req.user.id) {
      return res.status(403).json({ error: "User without permission" })
    }
    next()
  }
}

module.exports = { authorize, isOwnerOrAdmin }
