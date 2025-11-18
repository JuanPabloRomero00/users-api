const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT utility functions
const jwtService = {
  generateToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    });
  },
  
  generateRefreshToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { 
      expiresIn: '30d' 
    });
  },
  
  generateResetToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    });
  },
  
  verifyResetToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
};

// User registration with user role
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

// Administrator registration with admin role
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

// User login
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

// Password recovery
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Email not found');
    error.status = 404;
    throw error;
  }
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  return { token, name: user.nombre, email: user.email };
};

// Reset password
exports.resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    const error = new Error('Invalid or expired token');
    error.status = 400;
    throw error;
  }
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return { message: 'Password updated successfully' };
};

// Admin: Get all users
exports.getAllUsers = async (requestingUser) => {
  if (requestingUser.role !== 'admin') {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  return await User.find();
};

// Admin: Update user by ID
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

// Admin: Delete user by ID
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

// Get user data by id (authenticated user or admin only)
exports.getMe = async (requestingUser) => {
  const user = await User.findById(requestingUser.id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
};

