require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles, authorizeCustomersOnly } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET;

const OrdersService = require('../services/ordersService');

router.get('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(OrdersService.getAll());
});

router.post('/', authenticateJWT(SECRET), authorizeCustomersOnly(), (req, res) => {
  const { clientId, productIds } = req.body;
  if (!clientId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'ClientId y productIds son requeridos' });
  }
  try {
    const newOrder = OrdersService.create({ clientId, productIds });
    res.status(201).json(newOrder);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/client/:clientId', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { clientId } = req.params;
  const orders = OrdersService.getByClientId(clientId);
  res.json(orders);
});

router.get('/date-range/:startDate/:endDate', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { startDate, endDate } = req.params;
  try {
    const orders = OrdersService.getByDateRange(startDate, endDate);
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
    const total = OrdersService.calculateTotal(productIds);
    res.json({ total, productIds });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get('/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const order = OrdersService.getById(id);
  res.json(order);
});

router.get('/stats/revenue', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const totalRevenue = OrdersService.getTotalRevenue();
  res.json({ totalRevenue, timestamp: new Date().toISOString() });
});

router.get('/stats/today', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const todayOrders = OrdersService.getOrdersToday();
  res.json({ orders: todayOrders, count: todayOrders.length, date: new Date().toISOString().split('T')[0] });
});

router.get('/stats/client/:clientId/count', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { clientId } = req.params;
  const orderCount = OrdersService.getClientOrderCount(clientId);
  res.json({ clientId: parseInt(clientId), orderCount, timestamp: new Date().toISOString() });
});

module.exports = router;
