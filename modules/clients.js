// Componente Clients - Router para endpoints públicos de clientes
// Hereda de ClientsService para acceso a métodos básicos de clientes
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../auth');
const ClientsService = require('./ClientsService');

const SECRET = process.env.JWT_SECRET;

// Endpoints públicos relacionados con clientes (información básica)

// Obtener información básica de cliente (para usuarios autenticados)
router.get('/:id/info', authenticateJWT(SECRET), (req, res) => {
  const { id } = req.params;
  const client = ClientsService.getById(id);
  // Retornar solo información básica (sin datos sensibles administrativos)
  res.json({
    id: client.id,
    name: client.name,
    active: client.active !== false
  });
});

// Verificar si un cliente existe (para validaciones de órdenes)
router.get('/:id/exists', authenticateJWT(SECRET), (req, res) => {
  const { id } = req.params;
  const client = ClientsService.getById(id);
  const exists = !!client && client.active !== false;
  res.json({ exists, id: parseInt(id) });
});

// Buscar clientes por nombre (información básica, para usuarios autenticados)
router.get('/search/:name', authenticateJWT(SECRET), (req, res) => {
  const { name } = req.params;
  const clients = ClientsService.getByName(name);
  // Filtrar solo clientes activos y retornar información básica
  const publicClients = clients
    .filter(client => client.active !== false)
    .map(client => ({
      id: client.id,
      name: client.name
    }));
  res.json(publicClients);
});

// Obtener lista de clientes activos (información básica)
router.get('/active', authenticateJWT(SECRET), (req, res) => {
  const activeClients = ClientsService.getActiveClients();
  // Retornar solo información básica
  const publicClients = activeClients.map(client => ({
    id: client.id,
    name: client.name
  }));
  res.json(publicClients);
});

// Endpoint para que los usuarios registrados puedan ver estadísticas básicas
router.get('/stats/public', authenticateJWT(SECRET), (req, res) => {
  const stats = ClientsService.getClientStats();
  // Retornar solo estadísticas básicas (sin información administrativa)
  res.json({
    totalActiveClients: stats.active,
    timestamp: stats.timestamp
  });
});

module.exports = router;
module.exports.ClientsService = ClientsService;
