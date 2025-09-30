require('dotenv').config();

const cluster = require('cluster');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { authenticateJWT, authorizeRoles } = require('./src/middleware/auth');
const UserService = require('./src/services/userService');

const userService = new UserService();

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

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
      const user = userService.findByCredentials(username, password);

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { sub: user.id, username: user.username, roles: user.roles },
        SECRET,
        { expiresIn: '1h' }
      );

      res.json({ 
        token,
        user: { id: user.id, username: user.username, roles: user.roles }
      });
    });

    const productsController = require('./src/controllers/productsController');
    const clientsController = require('./src/controllers/clientsController');
    const ordersController = require('./src/controllers/ordersController');
    const adminController = require('./src/controllers/adminController');
    
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