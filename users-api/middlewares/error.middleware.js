module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  // Mensaje de error predeterminado
  let message = err.message || 'Ocurrió un error inesperado.';

  // si viene un mensaje detallado en err.details, usamos ese mensaje
  if (
    err.details &&
    typeof err.details.message === 'string' &&
    err.details.message.trim().length > 0
  ) {
    message = err.details.message.trim();
  }

  // Si no hay mensaje válido o es genérico, asignamos uno basado en el código de estado
  if (!message.trim() || message === 'Error en el microservicio') {
    if (status === 400) message = 'Solicitud inválida.';
    if (status === 401) message = 'No autorizado.';
    if (status === 403) message = 'Acceso denegado.';
    if (status === 404) message = 'Recurso no encontrado.';
    if (status === 409) message = 'Conflicto: recurso duplicado o en uso.';
    if (status === 500) message = 'Error interno del servidor.';
  }

  res.status(status).json({
    error: true,
    message,
    code: status
  });
};

