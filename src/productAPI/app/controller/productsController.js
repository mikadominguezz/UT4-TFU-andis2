require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware de autenticación JWT
function authenticateJWT(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Middleware de autorización
function authorizeRoles(roles) {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({ error: `Se requiere rol: ${roles.join(' o ')}` });
    }
    next();
  };
}

// Datos hardcodeados para pruebas
let products = [
  { id: 1, name: 'Laptop Gaming', price: 1500 },
  { id: 2, name: 'Mouse Inalámbrico', price: 50 },
  { id: 3, name: 'Teclado Mecánico', price: 120 }
];

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Product API is healthy' });
});

// GET /products - Obtener todos los productos
router.get('/products', authenticateJWT, (req, res) => {
  console.log(`📦 Products API: Usuario ${req.user.username} consultando productos`);
  res.json(products);
});

// POST /products - Crear producto (solo admin)
router.post('/products', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
  const { name, price } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Name y price son requeridos' });
  }
  
  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price)
  };
  
  products.push(newProduct);
  console.log(`📦 Products API: Admin ${req.user.username} creó producto: ${name}`);
  
  res.status(201).json({
    message: 'Producto creado exitosamente',
    product: newProduct
  });
});

// PUT /products/:id - Modificar producto (solo admin)
router.put('/products/:id', authenticateJWT, authorizeRoles(['admin']), (req, res) => {
  const productId = parseInt(req.params.id.replace('p', '')); // Manejar tanto "1" como "p1"
  const { name, price } = req.body;
  
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  if (name) products[productIndex].name = name;
  if (price) products[productIndex].price = parseFloat(price);
  
  console.log(`📦 Products API: Admin ${req.user.username} modificó producto ID ${productId}`);
  
  res.json({
    message: 'Producto modificado exitosamente',
    product: products[productIndex]
  });
});

// GET /products/:id - Obtener producto específico
router.get('/products/:id', authenticateJWT, (req, res) => {
  const productId = parseInt(req.params.id.replace('p', ''));
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  
  res.json(product);
});

module.exports = router;