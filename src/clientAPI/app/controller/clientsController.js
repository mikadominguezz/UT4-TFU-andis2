require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles, authorizeCustomersOnly } = require('../middleware/auth');
const ClientsService = require('../service/clientsService');

const SECRET = process.env.JWT_SECRET;

// Ruta principal para obtener todos los clientes
router.get('/', authenticateJWT(SECRET), async (req, res) => {
  try {
    const clients = await ClientsService.getClients();
    res.json(clients);
  } catch (error) {
    console.error('Controller Error - getClients:', error);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

router.get('/:id/info', authenticateJWT(SECRET), async (req, res) => {
  try {
    const { id } = req.params;
    const client = await ClientsService.getClientById(id);
    res.json({ id: client._id, name: client.name, active: client.isActive });
  } catch (error) {
    console.error('Controller Error - getClientInfo:', error);
    res.status(404).json({ error: 'Client not found' });
  }
});

router.get('/:id/exists', authenticateJWT(SECRET), async (req, res) => {
  try {
    const { id } = req.params;
    const client = await ClientsService.getClientById(id);
    res.json({ exists: !!client, id: parseInt(id) });
  } catch (error) {
    res.json({ exists: false, id: parseInt(id) });
  }
});

router.get('/search/:name', authenticateJWT(SECRET), async (req, res) => {
  try {
    const { name } = req.params;
    const clients = await ClientsService.getClientsByName(name);
    const publicClients = clients.map(client => ({ id: client._id, name: client.name }));
    res.json(publicClients);
  } catch (error) {
    console.error('Controller Error - searchClients:', error);
    res.status(500).json({ error: 'Error searching clients' });
  }
});

router.get('/active', authenticateJWT(SECRET), async (req, res) => {
  try {
    const activeClients = await ClientsService.getActiveClients();
    const publicClients = activeClients.map(client => ({ id: client._id, name: client.name }));
    res.json(publicClients);
  } catch (error) {
    console.error('Controller Error - getActiveClients:', error);
    res.status(500).json({ error: 'Error fetching active clients' });
  }
});

router.get('/stats/public', authenticateJWT(SECRET), async (req, res) => {
  try {
    const stats = await ClientsService.getClientStats();
    res.json({ totalActiveClients: stats.active, timestamp: stats.timestamp });
  } catch (error) {
    console.error('Controller Error - getClientStats:', error);
    res.status(500).json({ error: 'Error fetching client statistics' });
  }
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Clients API is healthy' });
});

module.exports = router;
