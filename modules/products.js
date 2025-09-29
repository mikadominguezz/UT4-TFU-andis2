// Módulo de productos
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../auth');

// Simulación de servicios sin estado: los datos se obtienen de la interfaz
const { ProductsInterface } = require('./interfaces');

const SECRET = process.env.JWT_SECRET;

// Obtener todos los productos (requiere autenticación)
router.get('/', authenticateJWT(SECRET), (req, res) => {
  res.json(ProductsInterface.getAll());
});

// Crear producto (solo admins)
router.post('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  // En un servicio sin estado, la creación no modifica el estado local
  const newProduct = { id: Date.now(), name, price };
  res.status(201).json(newProduct);
});

// Modificar producto (solo admins)
router.put('/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  // Simular actualización
  const updated = { id, name, price };
  res.json(updated);
});

module.exports = router;
