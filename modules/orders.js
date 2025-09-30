// Módulo de órdenes
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles, authorizeCustomersOnly } = require('../auth');

const SECRET = process.env.JWT_SECRET;

// Datos hardcodeados internos del módulo de órdenes
const ordersData = [
  { 
    id: 1, 
    clientId: 1, 
    productIds: [1, 2], 
    date: '2024-09-01T10:30:00Z',
    total: 300
  },
  { 
    id: 2, 
    clientId: 2, 
    productIds: [1], 
    date: '2024-09-15T14:45:00Z',
    total: 100
  }
];

// Funciones internas para manejar órdenes
const OrdersService = {
  getAll: () => ordersData,
  getById: (id) => {
    const order = ordersData.find(o => o.id == id);
    return order || { 
      id: parseInt(id), 
      clientId: 1, 
      productIds: [1,2], 
      date: new Date().toISOString(), 
      total: 300 
    };
  }
};

// Importar servicios de otros módulos para validaciones cruzadas
const { ProductsService } = require('./products');
const { ClientsService } = require('./clients');

// Simulación de servicios sin estado: no se almacena el estado de las órdenes

// Obtener todas las órdenes (solo admins)
router.get('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(OrdersService.getAll());
});

// Crear orden (solo clientes, no admins)
router.post('/', authenticateJWT(SECRET), authorizeCustomersOnly(), (req, res) => {
  const { clientId, productIds } = req.body;
  if (!clientId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'ClientId y productIds son requeridos' });
  }
  
  // Validar cliente y productos usando los servicios internos
  const client = ClientsService.getById(clientId);
  const products = productIds.map(id => ProductsService.getById(id));
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
