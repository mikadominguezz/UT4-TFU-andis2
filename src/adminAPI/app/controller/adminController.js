require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../../../middleware/auth');
const AdminService = require('../service/adminService');
const db = require('../../../database');

const SECRET = process.env.JWT_SECRET;

db.connect();

router.get('/clients', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(AdminService.getAllClientsWithDetails());
});

router.post('/clients', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre es requerido' });
  const newClient = AdminService.createClientAsAdmin({ name, email });
  res.status(201).json(newClient);
});

router.get('/clients/search/:name', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name } = req.params;
  const clients = AdminService.getByName(name);
  res.json(clients);
});

router.get('/clients/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const client = AdminService.getById(id);
  res.json(client);
});

router.put('/clients/:id', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { name, email, active } = req.body;
  if (!name) return res.status(400).json({ error: 'Nombre es requerido' });
  const updated = AdminService.updateClientAsAdmin(id, { name, email, active });
  res.status(200).json(updated);
});

router.get('/dashboard', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const stats = AdminService.getAdminStats ? AdminService.getAdminStats() : {};
  stats.adminUser = req.user.username;
  res.json(stats);
});

router.patch('/clients/:id/status', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  if (active === undefined) return res.status(400).json({ error: 'Campo active es requerido (true/false)' });
  const updatedClient = AdminService.toggleClientStatus(id, active);
  res.json(updatedClient);
});

router.post('/clients/advanced-search', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const criteria = req.body;
  const results = AdminService.advancedClientSearch ? AdminService.advancedClientSearch(criteria) : [];
  res.json({ criteria, results, count: results.length });
});

router.get('/reports/clients', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const report = AdminService.generateClientReport ? AdminService.generateClientReport() : {};
  res.json(report);
});

router.post('/clients/bulk-update', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { clientIds, updateData } = req.body;
  if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) return res.status(400).json({ error: 'clientIds debe ser un array no vacío' });
  if (!updateData || typeof updateData !== 'object') return res.status(400).json({ error: 'updateData es requerido' });
  const result = AdminService.bulkUpdateClients ? AdminService.bulkUpdateClients(clientIds, updateData) : {};
  res.json(result);
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Admin API is healthy' });
});

module.exports = router;
