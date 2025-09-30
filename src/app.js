require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const productsRouter = require('./routes/products');
const clientsRouter = require('./routes/clients');
const ordersRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');

function createApp() {
  const app = express();
  app.use(bodyParser.json());

  // HealthCheck
  app.get('/health', (req, res) => res.json({ ok: true, pid: process.pid }));

  // Routes
  app.use('/products', productsRouter);
  app.use('/clients', clientsRouter);
  app.use('/orders', ordersRouter);
  app.use('/admin', adminRouter);

  app.get('/', (req, res) => {
    res.send('Mini e-commerce API funcionando');
  });

  app.get('/public', (req, res) => res.json({ message: 'Recurso público', pid: process.pid }));

  return app;
}

module.exports = { createApp };
