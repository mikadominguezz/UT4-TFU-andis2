require('dotenv').config();

const cluster = require('cluster');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { authenticateJWT, authorizeRoles } = require('./src/middleware/auth');

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

const db = require('./src/database');
db.connect();

if (cluster.isMaster || cluster.isPrimary) {
  const workers = parseInt(process.env.WEB_CONCURRENCY) || 2;
  console.log(`🎯 Master PID ${process.pid} iniciando ${workers} workers`);

  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️  Worker ${worker.process.pid} terminó. Reiniciando...`);
    cluster.fork();
  });

} else {
  (async () => {
    const { createApp } = require('./src/app');
    const app = await createApp();

    app.use(express.static('public'));

    app.post('/login', (req, res) => {
      const { username, password } = req.body;
      // Remove userService logic
      return res.status(501).json({ error: 'Funcionalidad no implementada' });
    });

    const productsController = require('./src/productAPI/app/controller/productsController');
    const clientsController = require('./src/clientAPI/app/controller/clientsController');
    const ordersController = require('./src/orderAPI/app/controller/ordersController');
    const adminController = require('./src/adminAPI/app/controller/adminController');
    
    app.use('/api/products', productsController);
    app.use('/api/clients', clientsController);
    app.use('/api/orders', ordersController);
    app.use('/api/admin', adminController);

    const server = app.listen(PORT, () => {
      console.log(`✅ Worker PID ${process.pid} escuchando en puerto ${PORT}`);
    });
    
    process.on('SIGTERM', () => {
      console.log(`🔄 Worker ${process.pid} recibió SIGTERM, cerrando...`);
      server.close(() => {
        process.exit(0);
      });
    });
  })().catch(console.error);
}