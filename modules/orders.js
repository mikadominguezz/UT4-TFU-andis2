// Módulo de órdenes
const express = require('express');
const router = express.Router();
const { ProductsInterface, ClientsInterface } = require('./interfaces');

// Simulación de servicios sin estado: no se almacena el estado de las órdenes

// Obtener todas las órdenes (simulado)
router.get('/', (req, res) => {
  res.json([]);
});

// Crear orden (solo simula la creación, no persiste)
router.post('/', (req, res) => {
  const { clientId, productIds } = req.body;
  // Validar cliente y productos usando interfaces
  const client = ClientsInterface.getById(clientId);
  const products = productIds.map(id => ProductsInterface.getById(id));
  if (!client || products.some(p => !p)) {
    return res.status(400).json({ error: 'Cliente o producto inválido' });
  }
  const newOrder = {
    id: Date.now(),
    clientId,
    productIds,
    date: new Date().toISOString()
  };
  res.status(201).json(newOrder);
});

module.exports = router;
