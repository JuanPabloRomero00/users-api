const connectDB = require('./config/db');
require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
  console.log(`Users API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();