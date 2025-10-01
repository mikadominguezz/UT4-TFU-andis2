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
  app.post('/products', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
    try {
      const response = await axios.post('http://products-api:3003/products', req.body, {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al crear producto:', err.message);
      res.status(500).json({ error: 'No se pudo crear el producto' });
    }
  });

  app.put('/products/:id', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
    try {
      const response = await axios.put(`http://products-api:3003/products/${req.params.id}`, req.body, {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al modificar producto:', err.message);
      res.status(500).json({ error: 'No se pudo modificar el producto' });
    }
  });

  // Ruta para obtener productos con autenticación
  app.get('/products', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
    try {
      const response = await axios.get('http://products-api:3003/products', {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al obtener productos:', err.message);
      // Si el microservicio no está disponible, devolver datos hardcodeados
      const products = [
        { id: 1, name: 'Product A', price: 100 },
        { id: 2, name: 'Product B', price: 200 }
      ];
      res.status(200).json(products);
    }
  });

  // Ruta protegida
  app.get('/protected', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
    res.status(200).json({ 
      message: 'Acceso autorizado', 
      user: req.user 
    });
  });

  // Ruta solo para admins
  app.get('/admin-only', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
    const roles = (req.user && req.user.roles) || [];
    if (!roles.includes('admin')) {
      return res.status(403).json({ error: 'Solo administradores' });
    }
    res.status(200).json({ 
      message: 'Área de administración', 
      user: req.user 
    });
  });

  // 👉 Rutas hacia microservicio de Órdenes
  app.get('/orders', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
    try {
      const response = await axios.get('http://orders-api:3004/orders', {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al obtener órdenes:', err.message);
      res.status(500).json({ error: 'No se pudieron obtener las órdenes' });
    }
  });

  app.post('/orders', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
    try {
      const response = await axios.post('http://orders-api:3004/orders', req.body, {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al crear orden:', err.message);
      res.status(500).json({ error: 'No se pudo crear la orden' });
    }
  });

  // 👉 Rutas hacia microservicio de Clientes
  app.get('/clients', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
    try {
      const response = await axios.get('http://client-api:3002/clients', {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al obtener clientes:', err.message);
      res.status(500).json({ error: 'No se pudieron obtener los clientes' });
    }
  });

  app.post('/clients', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
    try {
      const response = await axios.post('http://client-api:3002/clients', req.body, {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al crear cliente:', err.message);
      res.status(500).json({ error: 'No se pudo crear el cliente' });
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

  return app;
}

module.exports = { createApp };
