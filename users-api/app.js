const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.GATEWAY_API_URL || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


const userRoutes = require('./routes/user.Routes');
app.use('/api/users', userRoutes);


const errorHandler = require('./middlewares/error.middleware');
app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;