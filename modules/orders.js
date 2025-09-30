require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles, authorizeCustomersOnly } = require('../auth');
const IOrdersService = require('./IOrdersService');

const SECRET = process.env.JWT_SECRET;

const { ProductsService } = require('./Products');
const ClientsService = require('./ClientsService');

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

class OrdersService extends IOrdersService {
  constructor() {
    super();

    this.data = ordersData;
  }

  getAll() {

    return super.getAll();
  }

  getById(id) {

    const order = this.data.find(o => o.id == id);
    return order || {
      id: parseInt(id),
      clientId: 1,
      productIds: [1,2],
      date: new Date().toISOString(),
      total: 300
    };
  }

  create(data) {
    const client = ClientsService.getById(data.clientId);
    const products = data.productIds.map(id => ProductsService.getById(id));

    if (!client || products.some(p => !p)) {
      throw new Error('Cliente o producto inválido');
    }

    const total = this.calculateTotal(data.productIds);

    const newOrder = {
      id: Date.now(),
      clientId: data.clientId,
      productIds: data.productIds,
      date: new Date().toISOString(),
      total,
      client: client.name,
      products: products.map(p => ({ id: p.id, name: p.name, price: p.price }))
    };

    return newOrder;
  }

  update(id, data) {

    return super.update(id, data);
  }

  delete(id) {

    return super.delete(id);
  }

  getByClientId(clientId) {
    return this.data.filter(o => o.clientId == clientId);
  }

  getByDateRange(startDate, endDate) {
    return this.data.filter(o => {
      const orderDate = new Date(o.date);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
  }

  calculateTotal(productIds) {
    const products = productIds.map(id => ProductsService.getById(id));
    return products.reduce((sum, product) => sum + (product ? product.price : 0), 0);
  }
}

const ordersServiceInstance = new OrdersService();

router.get('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(ordersServiceInstance.getAll());
});

router.post('/', authenticateJWT(SECRET), authorizeCustomersOnly(), (req, res) => {
  const { clientId, productIds } = req.body;
  if (!clientId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'ClientId y productIds son requeridos' });
  }

  try {
    const newOrder = ordersServiceInstance.create({ clientId, productIds });
    res.status(201).json(newOrder);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/client/:clientId', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { clientId } = req.params;
  const orders = ordersServiceInstance.getByClientId(clientId);
  res.json(orders);
});

router.get('/date-range/:startDate/:endDate', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { startDate, endDate } = req.params;
  try {
    const orders = ordersServiceInstance.getByDateRange(startDate, endDate);
    res.json(orders);
  } catch (error) {
    return res.status(400).json({ error: 'Formato de fecha inválido' });
  }
});

router.post('/calculate-total', authenticateJWT(SECRET), (req, res) => {
  const { productIds } = req.body;
  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({ error: 'productIds debe ser un array' });
  }
  try {
    const total = ordersServiceInstance.calculateTotal(productIds);
    res.json({ total, productIds });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const order = ordersServiceInstance.getById(id);
  res.json(order);
});
router.get('/stats/revenue', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const totalRevenue = ordersServiceInstance.getTotalRevenue();
  res.json({ totalRevenue, timestamp: new Date().toISOString() });
});
router.get('/stats/today', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const todayOrders = ordersServiceInstance.getOrdersToday();
  res.json({
    orders: todayOrders,
    count: todayOrders.length,
    date: new Date().toISOString().split('T')[0]
  });
});
router.get('/stats/client/:clientId/count', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { clientId } = req.params;
  const orderCount = ordersServiceInstance.getClientOrderCount(clientId);
  res.json({
    clientId: parseInt(clientId),
    orderCount,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
module.exports.OrdersService = ordersServiceInstance;
module.exports.OrdersServiceClass = OrdersService;