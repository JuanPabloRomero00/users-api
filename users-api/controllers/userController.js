const userService = require('../services/user.service');

// Public registry, role: default user
exports.register = async (req, res, next) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// Admin registration with secret key
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

// Password recovery (public)
exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await userService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Password reset
exports.resetPassword = async (req, res, next) => {
  try {
    const result = await userService.resetPassword(req.body.token, req.body.newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// List users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers(req.user);
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// Edit user (admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.user, req.params.id, req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.user, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Get authenticated user's profile data
exports.getMe = async (req, res, next) => {
  try {
    const user = await userService.getMe(req.user);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};