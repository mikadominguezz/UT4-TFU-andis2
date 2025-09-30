// Módulo de productos
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../auth');

const SECRET = process.env.JWT_SECRET;

// Datos hardcodeados internos del módulo de productos
const productsData = [
  { id: 1, name: 'Producto A', price: 100 },
  { id: 2, name: 'Producto B', price: 200 }
];

// Funciones internas para manejar productos
const ProductsService = {
  getAll: () => productsData,
  getById: (id) => {
    const product = productsData.find(p => p.id == id);
    return product || { id: parseInt(id), name: `Producto ${id}`, price: 100 * id };
  }
};

// Obtener todos los productos (requiere autenticación)
router.get('/', authenticateJWT(SECRET), (req, res) => {
  res.json(ProductsService.getAll());
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

// Exportar tanto el router como el servicio para uso interno
module.exports = router;
module.exports.ProductsService = ProductsService;
