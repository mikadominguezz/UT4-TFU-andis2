// Módulo de productos
const express = require('express');
const router = express.Router();

// Simulación de servicios sin estado: los datos se obtienen de la interfaz
const { ProductsInterface } = require('./interfaces');

// Obtener todos los productos
router.get('/', (req, res) => {
  res.json(ProductsInterface.getAll());
});

// Crear producto (solo simula la creación, no persiste)
router.post('/', (req, res) => {
  const { name, price } = req.body;
  // En un servicio sin estado, la creación no modifica el estado local
  const newProduct = { id: Date.now(), name, price };
  res.status(201).json(newProduct);
});

module.exports = router;
