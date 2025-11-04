const userService = require('../services/user.Service');

// Registro público, role: user por defecto
exports.register = async (req, res, next) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// Registro de administrador con clave secreta
exports.registerAdmin = async (req, res, next) => {
  try {
    const secret = req.body.secret;
    if (secret !== process.env.ADMIN_REGISTER_SECRET) {
      return next({ status: 403, message: 'Acceso denegado: secret inválido' });
    }
    const user = await userService.registerAdmin({ ...req.body });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const result = await userService.loginUser(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Recuperación de contraseña (pública)
exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await userService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Reset de contraseña
exports.resetPassword = async (req, res, next) => {
  try {
    const result = await userService.resetPassword(req.body.token, req.body.newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Listar usuarios (solo admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers(req.user);
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// Editar usuario (solo admin)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user, req.params.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// Eliminar usuario (solo admin)
exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.user, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Obtener datos del perfil del usuario autenticado
exports.getMe = async (req, res, next) => {
  try {
    const user = await userService.getMe(req.user);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};