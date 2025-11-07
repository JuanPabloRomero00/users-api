const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMailer = require('../services/sendMailer');

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
  console.log('=== FORGOT PASSWORD SERVICE ===');
  console.log('Email solicitado:', email);
  
  const user = await User.findOne({ email });
  console.log('Usuario encontrado:', !!user);
  
  if (!user) {
    console.log('ERROR: Email no encontrado en la base de datos');
    const error = new Error('Email not found');
    error.status = 404;
    throw error;
  }
  
  console.log('Generando token de reset...');
  const token = jwtService.generateResetToken({ id: user._id });
  console.log('Token generado:', !!token);
  
  console.log('Llamando a sendMailer.sendResetEmail...');
  const emailResult = await sendMailer.sendResetEmail(email, token, user.nombre);
  console.log('Resultado del envio:', emailResult);
  console.log('=== FIN FORGOT PASSWORD SERVICE ===');
  
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

