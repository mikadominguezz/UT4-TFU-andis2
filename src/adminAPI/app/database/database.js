const mongoose = require('mongoose');
const database = require('../../database');

class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGO_URI;
      
      const options = {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        readPreference: 'primaryPreferred',
        writeConcern: {
          w: 'majority',
          j: true,
          wtimeout: 1000
        }
      };

      this.connection = await mongoose.connect(mongoUri, options);
      
      console.log('✅ MongoDB conectado exitosamente');
      console.log(`📊 Base de datos: ${this.connection.connection.name}`);
      
      this.connection.connection.on('error', (err) => {
        console.error('❌ Error de conexión MongoDB:', err);
      });

      this.connection.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB desconectado');
      });

      this.connection.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconectado');
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('MongoDB desconectado');
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new DatabaseConnection();