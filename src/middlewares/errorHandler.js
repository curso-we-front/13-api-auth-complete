// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Email duplicado (código 11000 de MongoDB)
  if (err.code === 11000) {
    return res.status(400).json({ error: 'El email ya está registrado' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
}

module.exports = { errorHandler };
