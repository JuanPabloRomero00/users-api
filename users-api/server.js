const connectDB = require('./config/db');
require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Users API running on port ${PORT}`);
      console.log(`Render Server Status: RUNNING at ${new Date().toISOString()}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor');
    console.error('Render Server Status: FAILED at', new Date().toISOString());
    process.exit(1);
  }
};

startServer();