require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

const ProductsService = require('../service/productsService');

const SECRET = process.env.JWT_SECRET || 'techmart_super_secret_key_2025';

router.get('/', authenticateJWT(SECRET), async (req, res) => {
  try {
    const products = await ProductsService.getProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

router.post('/', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  const { name, price, description, category } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  try {
    const newProduct = await ProductsService.saveProduct({ name, price, description, category });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
});

router.get('/:id', authenticateJWT(SECRET), async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductsService.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Products API is healthy' });
});

module.exports = router;

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Products API is healthy' });
});

module.exports = router;
