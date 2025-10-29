const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { globalCache } = require('./utils/cacheAside');
const { gatewayOffloading } = require('./utils/gatewayOffloading');

async function createApp() {
  const app = express();
  
  // 🔒 Gateway Offloading Pattern - Aplicar middlewares de seguridad
  app.use(gatewayOffloading.securityHeaders()); // Headers de seguridad
  app.use(gatewayOffloading.validateInput()); // Validación de entrada
  app.use(gatewayOffloading.securityLogger()); // Logging de seguridad
  
  // Rate limiting para endpoints críticos
  const authRateLimit = gatewayOffloading.createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por IP
  });
  
  const generalRateLimit = gatewayOffloading.createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos  
    max: 100, // máximo 100 requests por IP
  });
  
  app.use('/login', authRateLimit);
  app.use(generalRateLimit);
  
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
  app.post('/products', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    async (req, res) => {
    try {
      const response = await axios.post('http://products-api:3003/products', req.body, {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      
      // Invalidar cache de productos después de crear uno nuevo
      globalCache.delete('products:all');
      console.log('🗑️ Cache de productos invalidado después de crear producto');
      
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al crear producto:', err.message);
      res.status(500).json({ error: 'No se pudo crear el producto' });
    }
  });

  app.put('/products/:id', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    async (req, res) => {
    try {
      const response = await axios.put(`http://products-api:3003/products/${req.params.id}`, req.body, {
        headers: {
          'Authorization': req.headers['authorization']
        }
      });
      
      // Invalidar cache de productos después de modificar uno
      globalCache.delete('products:all');
      globalCache.delete(`product:${req.params.id}`);
      console.log('🗑️ Cache de productos invalidado después de modificar producto');
      
      res.json(response.data);
    } catch (err) {
      console.error('❌ Error al modificar producto:', err.message);
      res.status(500).json({ error: 'No se pudo modificar el producto' });
    }
  });

  // Ruta para obtener productos con autenticación y Cache-Aside pattern
  app.get('/products', authenticateJWT(process.env.JWT_SECRET), async (req, res) => {
    try {
      // Implementación del patrón Cache-Aside
      const cacheKey = 'products:all';
      const products = await globalCache.getOrFetch(
        cacheKey,
        async () => {
          console.log('🔄 Consultando microservicio de productos...');
          const response = await axios.get('http://products-api:3003/products', {
            headers: {
              'Authorization': req.headers['authorization']
            },
            timeout: 5000 // Timeout de 5 segundos
          });
          return response.data;
        },
        180000 // Cache por 3 minutos para productos
      );
      
      res.json(products);
    } catch (err) {
      console.error('❌ Error al obtener productos:', err.message);
      // Circuit Breaker: Si el microservicio no está disponible, devolver datos hardcodeados
      const fallbackProducts = [
        { id: 1, name: 'Product A (Fallback)', price: 100 },
        { id: 2, name: 'Product B (Fallback)', price: 200 }
      ];
      res.status(200).json(fallbackProducts);
    }
  });

  // Ruta protegida
  app.get('/protected', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
    res.status(200).json({
      message: 'Acceso autorizado',
      user: req.user
    });
  });

  // Ruta solo para admins - usando Gateway Offloading
  app.get('/admin-only', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    (req, res) => {
      res.status(200).json({
        message: 'Área de administración - Gateway Offloading Pattern',
        user: req.user,
        pattern: 'Gateway Offloading'
      });
    }
  );

  // 👉 Rutas hacia microservicio de Órdenes
  app.get('/orders', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    async (req, res) => {
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

  app.post('/orders', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['user', 'admin']), // Los usuarios pueden crear órdenes
    async (req, res) => {
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
  app.get('/clients', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    async (req, res) => {
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

  app.post('/clients', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    async (req, res) => {
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

  // 📊 Endpoint para obtener estadísticas del cache (Cache-Aside Pattern)
  app.get('/cache/stats', authenticateJWT(process.env.JWT_SECRET), (req, res) => {
    const stats = globalCache.getStats();
    res.json({
      message: 'Estadísticas del Cache-Aside Pattern',
      cacheStats: stats,
      pattern: 'Cache-Aside',
      description: 'Patrón de rendimiento que mantiene datos frecuentemente accedidos en memoria'
    });
  });

  // 🗑️ Endpoint para limpiar el cache (solo admins)
  app.delete('/cache', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    (req, res) => {
      globalCache.clear();
      res.json({
        message: 'Cache limpiado exitosamente',
        pattern: 'Cache-Aside'
      });
    }
  );

  // 🔒 Endpoint para obtener estadísticas de seguridad (Gateway Offloading Pattern)
  app.get('/security/stats', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    (req, res) => {
      const stats = gatewayOffloading.getSecurityStats();
      res.json(stats);
    }
  );

  // 📋 Endpoint para obtener logs de seguridad (Gateway Offloading Pattern)
  app.get('/security/logs', 
    authenticateJWT(process.env.JWT_SECRET),
    gatewayOffloading.authorizeRoles(['admin']),
    (req, res) => {
      const limit = parseInt(req.query.limit) || 50;
      const logs = gatewayOffloading.getSecurityLogs(limit);
      res.json({
        logs: logs,
        pattern: 'Gateway Offloading',
        description: 'Logs de eventos de seguridad centralizados en el gateway'
      });
    }
  );

  // Ruta para login - con Gateway Offloading
  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validación de entrada mejorada
    if (!username || !password) {
      gatewayOffloading.logSecurityEvent('INVALID_LOGIN_ATTEMPT', {
        reason: 'Missing username or password',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(400).json({ 
        error: 'Username y password son requeridos',
        pattern: 'Gateway Offloading - Input Validation'
      });
    }

    const users = [
      { username: 'alice', password: 'alicepass', roles: ['user'] },
      { username: 'bob', password: 'bobpass', roles: ['admin'] }
    ];

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      gatewayOffloading.logSecurityEvent('FAILED_LOGIN_ATTEMPT', {
        username: username,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        pattern: 'Gateway Offloading - Authentication'
      });
    }

    // Login exitoso
    gatewayOffloading.logSecurityEvent('SUCCESSFUL_LOGIN', {
      username: user.username,
      roles: user.roles,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const token = jwt.sign({
      username: user.username,
      roles: user.roles
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ 
      token,
      pattern: 'Gateway Offloading - Authentication'
    });
  });

  return app;
}

module.exports = { createApp };
