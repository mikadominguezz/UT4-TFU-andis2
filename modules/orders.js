// Módulo de órdenes
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles, authorizeCustomersOnly } = require('../auth');
const { ProductsInterface, ClientsInterface, OrdersInterface } = require('./interfaces');

const SECRET = process.env.JWT_SECRET;

// Simulación de servicios sin estado: no se almacena el estado de las órdenes

// Obtener todas las órdenes (solo admins)
router.get('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(OrdersInterface.getAll());
});

// Crear orden (solo clientes, no admins)
router.post('/', authenticateJWT(SECRET), authorizeCustomersOnly(), (req, res) => {
  const { clientId, productIds } = req.body;
  if (!clientId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'ClientId y productIds son requeridos' });
  }
  
  // Validar cliente y productos usando interfaces
  const client = ClientsInterface.getById(clientId);
  const products = productIds.map(id => ProductsInterface.getById(id));
  if (!client || products.some(p => !p)) {
    return res.status(400).json({ error: 'Cliente o producto inválido' });
  }
  
  // Calcular total de la orden
  const total = products.reduce((sum, product) => sum + product.price, 0);
  
  const newOrder = {
    id: Date.now(),
    clientId,
    productIds,
    date: new Date().toISOString(),
    total,
    client: client.name,
    products: products.map(p => ({ id: p.id, name: p.name, price: p.price }))
  };
  res.status(201).json(newOrder);
});

module.exports = router;
