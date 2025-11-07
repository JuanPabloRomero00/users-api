const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    
    console.log('MongoDB conectado exitosamente');
    console.log(`Render DB Connection Status: SUCCESS at ${new Date().toISOString()}`);

    // Event listeners para monitorear la conexión
    mongoose.connection.on('error', () => {
      console.error('Error de conexión MongoDB');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado');
    });

  } catch (error) {
    console.error('Error de conexión a MongoDB');
    console.log('Render DB Connection Status: FAILED at', new Date().toISOString());
    process.exit(1);
  }
};

module.exports = connectDB;