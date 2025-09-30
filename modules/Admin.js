// Componente Admin - Gestión administrativa de clientes
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../auth');
const AdminService = require('./AdminService');

const SECRET = process.env.JWT_SECRET;

// Rutas administrativas para gestión de clientes

// Obtener todos los clientes con detalles administrativos (solo admins)
router.get('/clients', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(AdminService.getAllClientsWithDetails());
});

// Crear cliente como admin (solo admins)
router.post('/clients', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name, email } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }
  const newClient = AdminService.createClientAsAdmin({ name, email });
  res.status(201).json(newClient);
});

// Buscar cliente por nombre (solo admins)
router.get('/clients/search/:name', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name } = req.params;
  const clients = AdminService.getByName(name);
  res.json(clients);
});

// Obtener cliente específico por ID (solo admins)
router.get('/clients/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const client = AdminService.getById(id);
  res.json(client);
});

// Actualizar cliente como admin (solo admins)
router.put('/clients/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { name, email, active } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }
  const updated = AdminService.updateClientAsAdmin(id, { name, email, active });
  res.status(200).json(updated);
});

// Panel de estadísticas admin (solo admins)
router.get('/dashboard', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const stats = AdminService.getAdminStats();
  stats.adminUser = req.user.username;
  res.json(stats);
});

// Activar/desactivar cliente (solo admins)
router.patch('/clients/:id/status', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  if (active === undefined) {
    return res.status(400).json({ error: 'Campo active es requerido (true/false)' });
  }
  const updatedClient = AdminService.toggleClientStatus(id, active);
  res.json(updatedClient);
});

// Búsqueda avanzada de clientes (solo admins)
router.post('/clients/advanced-search', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const criteria = req.body;
  const results = AdminService.advancedClientSearch(criteria);
  res.json({
    criteria,
    results,
    count: results.length
  });
});

// Generar reporte completo de clientes (solo admins)
router.get('/reports/clients', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const report = AdminService.generateClientReport();
  res.json(report);
});

// Operaciones masivas en clientes (solo admins)
router.post('/clients/bulk-update', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { clientIds, updateData } = req.body;
  if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
    return res.status(400).json({ error: 'clientIds debe ser un array no vacío' });
  }
  if (!updateData || typeof updateData !== 'object') {
    return res.status(400).json({ error: 'updateData es requerido' });
  }
  
  const result = AdminService.bulkUpdateClients(clientIds, updateData);
  res.json(result);
});

module.exports = router;