require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const database = require('./config/database');

const productsController = require('./controllers/productsController');
const clientsController = require('./controllers/clientsController');
const ordersController = require('./controllers/ordersController');
const adminController = require('./controllers/adminController');

async function createApp() {
  const app = express();
  app.use(bodyParser.json());

  try {
    await database.connect();
    console.log('🚀 TechMart API iniciada con MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }

  
  app.get('/health', (req, res) => res.json({ ok: true, pid: process.pid }));

  
  app.use('/products', productsController);
  app.use('/clients', clientsController);
  app.use('/orders', ordersController);
  app.use('/admin', adminController);

  app.get('/', (req, res) => {
    res.send('Mini e-commerce API funcionando');
  });

  app.get('/public', (req, res) => res.json({ message: 'Recurso público', pid: process.pid }));

  return app;
}

module.exports = { createApp };
