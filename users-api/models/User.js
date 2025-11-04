const mongoose = require('mongoose');
const { number } = require('zod');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  timestamp: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);