const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Middlewares para roles y admin, asumiendo que el usuario ya está autenticado
function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  next();
}

function authorizeSelfOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(403).json({ error: 'Forbidden: not authenticated' });
  }
  if (req.user.role === 'admin' || req.user.id === req.params.id) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: not allowed' });
}

module.exports = { authenticateJWT, authorizeAdmin, authorizeSelfOrAdmin };
