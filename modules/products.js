require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../auth');
const IProductsService = require('./IProductsService');

const SECRET = process.env.JWT_SECRET;

const productsData = [
  { id: 1, name: 'Producto A', price: 100, category: 'electrónicos' },
  { id: 2, name: 'Producto B', price: 200, category: 'hogar' },
  { id: 3, name: 'Producto C', price: 150, category: 'electrónicos' },
  { id: 4, name: 'Producto D', price: 75, category: 'hogar' }
];

class ProductsService extends IProductsService {
  constructor() {
    super();
    // Pasar los datos específicos de productos a la clase base
    this.data = productsData;
  }

  getAll() {
    // Usar implementación de la clase base
    return super.getAll();
  }

  getById(id) {
    // Sobrescribir para lógica específica de productos
    const product = this.data.find(p => p.id == id);
    return product || { id: parseInt(id), name: `Producto ${id}`, price: 100 * id, category: 'general' };
  }

  create(data) {
    const newProduct = {
      id: Date.now(),
      name: data.name,
      price: data.price,
      category: data.category || 'general'
    };
    return newProduct;
  }

  update(id, data) {
    // Usar implementación de la clase base
    return super.update(id, data);
  }

  delete(id) {
    // Usar implementación de la clase base
    return super.delete(id);
  }

  getByCategory(category) {
    return this.data.filter(p => 
      p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }

  updatePrice(id, price) {
    const product = this.getById(id);
    if (product) {
      return { ...product, price };
    }
    return null;
  }
}

const productsServiceInstance = new ProductsService();

router.get('/', authenticateJWT(SECRET), (req, res) => {
  res.json(productsServiceInstance.getAll());
});

router.post('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const newProduct = productsServiceInstance.create({ name, price });
  res.status(201).json(newProduct);
});

router.put('/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;
  const updated = productsServiceInstance.update(id, { name, price, category });
  res.json(updated);
});

router.get('/category/:category', authenticateJWT(SECRET), (req, res) => {
  const { category } = req.params;
  const products = productsServiceInstance.getByCategory(category);
  res.json(products);
});

router.patch('/:id/price', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  if (price === undefined) {
    return res.status(400).json({ error: 'Price es requerido' });
  }
  try {
    const updated = productsServiceInstance.updatePrice(id, price);
    if (!updated) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Obtener productos por rango de precio
router.get('/price/:minPrice/:maxPrice', authenticateJWT(SECRET), (req, res) => {
  const { minPrice, maxPrice } = req.params;
  const products = productsServiceInstance.getByPriceRange(minPrice, maxPrice);
  res.json(products);
});

// Obtener todas las categorías disponibles
router.get('/categories', authenticateJWT(SECRET), (req, res) => {
  const categories = productsServiceInstance.getCategories();
  res.json(categories);
});

// Buscar productos por nombre
router.get('/search/:searchTerm', authenticateJWT(SECRET), (req, res) => {
  const { searchTerm } = req.params;
  const products = productsServiceInstance.searchByName(searchTerm);
  res.json(products);
});

module.exports = router;
module.exports.ProductsService = productsServiceInstance;
module.exports.ProductsServiceClass = ProductsService;
