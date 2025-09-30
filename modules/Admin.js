// Componente Admin - Gestión administrativa de clientes
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../auth');
const ClientsService = require('./ClientsService');

const SECRET = process.env.JWT_SECRET;

// Rutas administrativas para gestión de clientes

// Obtener todos los clientes (solo admins)
router.get('/clients', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(ClientsService.getAll());
});

// Crear cliente (solo admins)
router.post('/clients', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name, email } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }
  const newClient = ClientsService.create({ name, email });
  res.status(201).json(newClient);
});

// Buscar cliente por nombre (solo admins)
router.get('/clients/search/:name', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name } = req.params;
  const clients = ClientsService.getByName(name);
  res.json(clients);
});

// Obtener cliente específico por ID (solo admins)
router.get('/clients/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const client = ClientsService.getById(id);
  res.json(client);
});

// Actualizar cliente (solo admins)
router.put('/clients/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }
  const updated = ClientsService.update(id, { name, email });
  res.status(200).json(updated);
});

// Panel de estadísticas admin (solo admins)
router.get('/dashboard', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const stats = ClientsService.getClientStats();
  stats.adminUser = req.user.username;
  res.json(stats);
});

// Buscar clientes por email (solo admins)
router.get('/clients/email/:email', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { email } = req.params;
  const client = ClientsService.getByEmail(email);
  if (!client) {
    return res.status(404).json({ error: 'Cliente no encontrado con ese email' });
  }
  res.json(client);
});

// Obtener solo clientes activos (solo admins)
router.get('/clients/active', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const activeClients = ClientsService.getActiveClients();
  res.json(activeClients);
});

// Búsqueda general de clientes (solo admins)
router.get('/clients/search-term/:term', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { term } = req.params;
  const results = ClientsService.searchClients(term);
  res.json({
    searchTerm: term,
    results,
    count: results.length
  });
});

// Obtener clientes por rango de fechas (solo admins)
router.get('/clients/date-range/:startDate/:endDate', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { startDate, endDate } = req.params;
  try {
    const clients = ClientsService.getClientsByDateRange(startDate, endDate);
    res.json({
      startDate,
      endDate,
      clients,
      count: clients.length
    });
  } catch (error) {
    return res.status(400).json({ error: 'Formato de fecha inválido' });
  }
});

module.exports = router;