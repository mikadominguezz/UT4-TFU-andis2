require('dotenv').config();

const cluster = require('cluster');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { authenticateJWT, authorizeRoles } = require('./middleware/auth');

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

      const users = [
        { username: 'alice', password: 'alicepass', roles: ['user'] },
        { username: 'bob', password: 'bobpass', roles: ['admin'] }
      ];

      const user = users.find(u => u.username === username && u.password === password);

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign({
        username: user.username,
        roles: user.roles
      }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ token });
    });

    // No more direct controller imports - everything goes through HTTP to microservices

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