require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles, authorizeCustomersOnly } = require('../middleware/auth');
const OrdersService = require('../service/ordersService');
const db = require('../database/database');
const Order = require('../schema/OrderSchema');

const SECRET = process.env.JWT_SECRET;

db.connect();

router.get('/', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const orders = await OrdersService.getOrders();
    res.json(orders);
  } catch (error) {
    console.error('Controller Error - getOrders:', error);
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
});

router.post('/', authenticateJWT(SECRET), authorizeCustomersOnly(), async (req, res) => {
  const { clientId, items } = req.body;
  if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'ClientId e items son requeridos' });
  }
  try {
    const newOrder = await OrdersService.saveOrder({ clientId, items });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Controller Error - createOrder:', error);
    return res.status(400).json({ error: error.message });
  }
});

router.get('/client/:clientId', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const { clientId } = req.params;
    const orders = await OrdersService.getOrdersByClientId(clientId);
    res.json(orders);
  } catch (error) {
    console.error('Controller Error - getOrdersByClient:', error);
    res.status(500).json({ error: 'Error fetching client orders' });
  }
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

router.get('/:id', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrdersService.getOrderById(id);
    res.json(order);
  } catch (error) {
    console.error('Controller Error - getOrderById:', error);
    res.status(404).json({ error: 'Order not found' });
  }
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

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Orders API is healthy' });
});

module.exports = router;
