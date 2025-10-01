require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../auth');
const ClientsService = require('./ClientsService');

const SECRET = process.env.JWT_SECRET;
router.get('/:id/info', authenticateJWT(SECRET), (req, res) => {
  const { id } = req.params;
  const client = ClientsService.getById(id);

  res.json({
    id: client.id,
    name: client.name,
    active: client.active !== false
  });
});
router.get('/:id/exists', authenticateJWT(SECRET), (req, res) => {
  const { id } = req.params;
  const client = ClientsService.getById(id);
  const exists = !!client && client.active !== false;
  res.json({ exists, id: parseInt(id) });
});
router.get('/search/:name', authenticateJWT(SECRET), (req, res) => {
  const { name } = req.params;
  const clients = ClientsService.getByName(name);

  const publicClients = clients
    .filter(client => client.active !== false)
    .map(client => ({
      id: client.id,
      name: client.name
    }));
  res.json(publicClients);
});
router.get('/active', authenticateJWT(SECRET), (req, res) => {
  const activeClients = ClientsService.getActiveClients();

  const publicClients = activeClients.map(client => ({
    id: client.id,
    name: client.name
  }));
  res.json(publicClients);
});
router.get('/stats/public', authenticateJWT(SECRET), (req, res) => {
  const stats = ClientsService.getClientStats();

  res.json({
    totalActiveClients: stats.active,
    timestamp: stats.timestamp
  });
});

module.exports = router;
module.exports.ClientsService = ClientsService;
