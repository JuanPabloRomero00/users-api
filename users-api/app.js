const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();


// CORS configuration for centralized gateway architecture
const allowedOrigins = [
  'https://gateway-api-lztd.onrender.com',
  process.env.GATEWAY_API_URL
].filter(Boolean);


// Use credentials only for trusted origins
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS policy'));
    }
  },


  // Allow credentials only for trusted origins
  credentials: function(req, callback) {
    const trustedForCredentials = [
      'https://gateway-api-lztd.onrender.com'
    ];
    const origin = req.headers.origin;
    if (!origin) {
      return callback(null, false);
    }
    const allowCredentials = trustedForCredentials.includes(origin);
    callback(null, allowCredentials);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400 // 24 hours
}));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Health check endpoint for Render
app.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;
  
  res.status(200).json({ 
    message: 'Users API is running successfully!', 
    timestamp: new Date().toISOString(),
    status: 'healthy',
    database: {
      connected: isDbConnected,
      status: isDbConnected ? 'connected' : 'disconnected'
    }
  });
});


// User routes
const userRoutes = require('./routes/user.Routes');
app.use('/api/users', userRoutes);


// Error handling middleware
app.use('*', (req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

const errorHandler = require('./middlewares/error.middleware');
app.use(errorHandler);

module.exports = app;