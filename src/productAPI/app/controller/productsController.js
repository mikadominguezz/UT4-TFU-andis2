require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../../../middleware/auth');
const mongoose = require('mongoose');

const SECRET = process.env.JWT_SECRET;

// Cambiar la importación incorrecta de ProductsService
const ProductsService = require('../service/productsService');
const db = require('../../../database');
db.connect();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://techmart-mongo:27017/productsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB')).catch(err => console.error('❌ Error conectando a MongoDB:', err));

router.get('/', authenticateJWT(SECRET), async (req, res) => {
  try {
    const products = await ProductsService.getAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

router.post('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const newProduct = ProductsService.create({ name, price });
  res.status(201).json(newProduct);
});

router.put('/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  const updated = ProductsService.update(id, { name, price, category });
  res.json(updated);
});

router.get('/category/:category', authenticateJWT(SECRET), (req, res) => {
  const { category } = req.params;
  const products = ProductsService.getByCategory(category);
  res.json(products);
});

router.patch('/:id/price', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  if (price === undefined) {
    return res.status(400).json({ error: 'Price es requerido' });
  }
  try {
    const updated = ProductsService.updatePrice(id, price);
    if (!updated) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/price/:minPrice/:maxPrice', authenticateJWT(SECRET), (req, res) => {
  const { minPrice, maxPrice } = req.params;
  const products = ProductsService.getByPriceRange(minPrice, maxPrice);
  res.json(products);
});

router.get('/categories', authenticateJWT(SECRET), (req, res) => {
  const categories = ProductsService.getCategories();
  res.json(categories);
});

router.get('/search/:searchTerm', authenticateJWT(SECRET), (req, res) => {
  const { searchTerm } = req.params;
  const products = ProductsService.searchByName(searchTerm);
  res.json(products);
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Products API is healthy' });
});

module.exports = router;
