const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwtService = require('../../gateway-api/services/jwt.service');
const sendMailer = require('../services/sendMailer');


exports.registerUser = async (userData) => {
    const { email, password, nombre, apellido, telefono } = userData;
    const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error('Ya existe un usuario con este email');
        error.status = 409;
        throw error;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, nombre, apellido, telefono, role: 'user' });
  return await user.save();
};

// Registro de administrador con rol admin
exports.registerAdmin = async (userData) => {
  const { email, password, nombre, apellido, telefono } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error('Ya existe un usuario con este email');
    error.status = 409;
    throw error;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, nombre, apellido, telefono, role: 'admin' });
  return await user.save();
};


exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const accessToken = jwtService.generateToken({ id: user._id, role: user.role });
  const refreshToken = jwtService.generateRefreshToken({ id: user._id, role: user.role });
  return { user, accessToken, refreshToken };
};


exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Email not found');
    error.status = 404;
    throw error;
  }
  const token = jwtService.generateResetToken({ id: user._id });
  await sendMailer.sendResetEmail(email, token);
  return { message: 'Reset email sent' };
};


exports.resetPassword = async (token, newPassword) => {
  const payload = jwtService.verifyResetToken(token);
  const user = await User.findById(payload.id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { message: 'Password updated' };
};


exports.getAllUsers = async (requestingUser) => {
  if (requestingUser.role !== 'admin') {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  return await User.find();
};


exports.updateUser = async (requestingUser, userId, updateData) => {
  if (requestingUser.role !== 'admin') {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
};


exports.deleteUser = async (requestingUser, userId) => {
  if (requestingUser.role !== 'admin') {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
};


exports.getMe = async (requestingUser) => {
  const user = await User.findById(requestingUser.id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
};

