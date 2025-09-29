const cluster = require('cluster');
const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { authenticateJWT, authorizeRoles } = require('./auth');
const users = require('./users');
const products = require('./products');

const PORT = process.env.PORT || 3000;
// acá podría haberlo definido en docker-compose.yml y despues en un archivo .env poner la clave
// para así después poner este codigo en la terminal: docker compose --env-file .env up --build
// pero decidimos hacerla hardcodeada.
const SECRET = process.env.JWT_SECRET || 'cambiame-por-una-secreta';

if (cluster.isMaster) {
  const cpus = process.env.WEB_CONCURRENCY || os.cpus().length;
  console.log(`Master pid=${process.pid} arrancando ${cpus} workers`);
  for (let i = 0; i < cpus; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} murió (${signal || code}). Forking otro...`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(bodyParser.json());

  // HealthCheck
  app.get('/health', (req, res) => res.json({ ok: true, pid: process.pid }));

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

  // products
  app.get('/products', authenticateJWT(SECRET), (req, res) => {
    res.json(products.getAll());
  });

  app.post('/products', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
    const { name, price } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: 'Faltan datos' });
    const product = products.create({ name, price });
    res.status(201).json(product);
  });

  app.put('/products/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
    const updated = products.update(id, { name, price });
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updated);
  });

  app.listen(PORT, () => console.log(`Worker pid=${process.pid} escuchando en ${PORT}`));
}
