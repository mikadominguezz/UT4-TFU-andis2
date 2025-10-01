const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

async function createApp() {
  const app = express();
  app.use(express.json());

  // Middleware de autenticación JWT
  function authenticateJWT(secret) {
    return (req, res, next) => {
      const token = req.headers['authorization']?.split(' ')[1];

      if (!token) {
        return res.sendStatus(401);
      }

      jwt.verify(token, secret, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }

        req.user = user;
        next();
      });
    };
  }

  // 👉 Rutas hacia microservicio de Productos
  app.get('/products', async (req, res) => {
    try {
      const response = await axios.get('http://products:3001/products');
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al obtener productos:', err.message);
      res.status(500).json({ error: 'No se pudieron obtener los productos' });
    }
  });

  app.post('/products', async (req, res) => {
    try {
      const response = await axios.post('http://products:3001/products', req.body);
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al crear producto:', err.message);
      res.status(500).json({ error: 'No se pudo crear el producto' });
    }
  });

  // Ruta para obtener productos con autenticación
  app.get('/products', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
    const products = [
      { id: 1, name: 'Product A', price: 100 },
      { id: 2, name: 'Product B', price: 200 }
    ];

    res.status(200).json(products);
  });

  // 👉 Rutas hacia microservicio de Órdenes
  app.get('/orders', async (req, res) => {
    try {
      const response = await axios.get('http://orders:3003/orders');
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al obtener órdenes:', err.message);
      res.status(500).json({ error: 'No se pudieron obtener las órdenes' });
    }
  });

  app.post('/orders', async (req, res) => {
    try {
      const response = await axios.post('http://orders:3003/orders', req.body);
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al crear orden:', err.message);
      res.status(500).json({ error: 'No se pudo crear la orden' });
    }
  });

  // 👉 Rutas hacia microservicio de Usuarios
  app.get('/users', async (req, res) => {
    try {
      const response = await axios.get('http://users:3002/users');
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al obtener usuarios:', err.message);
      res.status(500).json({ error: 'No se pudieron obtener los usuarios' });
    }
  });

  app.post('/users', async (req, res) => {
    try {
      const response = await axios.post('http://users:3002/users', req.body);
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al crear usuario:', err.message);
      res.status(500).json({ error: 'No se pudo crear el usuario' });
    }
  });

  // Ruta de health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'App is running' });
  });

  // Ruta para login
  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const users = [
      { username: 'alice', password: 'alicepass' },
      { username: 'bob', password: 'bobpass' }
    ];

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  });

  return app;
}

module.exports = { createApp };
