// Cargar variables de entorno
require('dotenv').config();

const cluster = require('cluster');
const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { authenticateJWT, authorizeRoles } = require('./auth');
const UserService = require('./userService');

// Instanciar el servicio de usuarios
const userService = new UserService();

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

if (cluster.isMaster) {
  const workers = parseInt(process.env.WEB_CONCURRENCY) || 8;
  console.log(`Master pid=${process.pid} arrancando exactamente ${workers} workers`);
  console.log(`CPUs disponibles: ${os.cpus().length}, Workers configurados: ${workers}`);
  for (let i = 0; i < workers; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} murió (${signal || code}). Forking otro...`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(bodyParser.json());

  // HealthCheck
  app.get('/health', (req, res) => res.json({ ok: true, pid: process.pid }));

  // Login endpoint
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
    res.json({ token, user: { id: user.id, username: user.username, roles: user.roles } });
  });

  // Importar módulos
  const productsRouter = require('./modules/products');
  const clientsRouter = require('./modules/clients');
  const ordersRouter = require('./modules/orders');

  // Definir rutas mínimas REST
  app.use('/products', productsRouter);
  app.use('/clients', clientsRouter);
  app.use('/orders', ordersRouter);

  app.get('/', (req, res) => {
    res.send('Mini e-commerce API funcionando');
  });

  app.get('/public', (req, res) => res.json({ message: 'Recurso público', pid: process.pid }));

  app.get('/protected', authenticateJWT(SECRET), (req, res) => {
    res.json({ message: 'Recurso protegido (autenticado)', user: req.user, pid: process.pid });
  });

  app.get('/admin-only', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Solo admins pueden ver esto', user: req.user, pid: process.pid });
  });

  app.listen(PORT, () => console.log(`Worker pid=${process.pid} escuchando en ${PORT}`));
}
