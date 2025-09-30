// Router para endpoints públicos de clientes
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
  // Retornar solo información básica (sin datos sensibles)
  res.json({
    id: client.id,
    name: client.name
  });
});

// Verificar si un cliente existe (para validaciones de órdenes)
router.get('/:id/exists', authenticateJWT(SECRET), (req, res) => {
  const { id } = req.params;
  const client = ClientsService.getById(id);
  res.json({ exists: !!client, id: parseInt(id) });
});

module.exports = router;
module.exports.ClientsService = ClientsService;
