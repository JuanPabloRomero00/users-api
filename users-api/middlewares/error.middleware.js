module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  // Default error message
  let message = err.message || 'Ocurrió un error inesperado.';

  // if a detailed message comes in err.details, we use that message
  if (
    err.details &&
    typeof err.details.message === 'string' &&
    err.details.message.trim().length > 0
  ) {
    message = err.details.message.trim();
  }

  // If there is no valid message or it is generic, we assign one based on the status code
  if (!message.trim() || message === 'Error inesperado.') {
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

