const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration for Gateway API communication
app.use(cors({
  origin: process.env.GATEWAY_API_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Health check endpoint for Render
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Users API is running successfully!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const userRoutes = require('./routes/user.Routes');
app.use('/api/users', userRoutes);


const errorHandler = require('./middlewares/error.middleware');
app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;