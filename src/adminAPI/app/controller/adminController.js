require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const AdminService = require('../service/adminService');

const SECRET = process.env.JWT_SECRET;

// Keep the original endpoints but with repository pattern
router.get('/clients', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const clients = await AdminService.getAllClientsWithDetails();
    res.json(clients);
  } catch (error) {
    console.error('Controller Error - getAllClients:', error);
    res.status(500).json({ error: 'Error fetching clients' });
  }
});

router.post('/clients', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre es requerido' });
    const newClient = await AdminService.createClientAsAdmin({ name, email });
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Controller Error - createClient:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/clients/search/:searchTerm', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const clients = await AdminService.searchClients(searchTerm);
    res.json(clients);
  } catch (error) {
    console.error('Controller Error - searchClients:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/clients/:id', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const client = await AdminService.getClientById(id);
    res.json(client);
  } catch (error) {
    console.error('Controller Error - getClientById:', error);
    res.status(404).json({ error: 'Client not found' });
  }
});

router.put('/clients/:id', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, active } = req.body;
    if (!name) return res.status(400).json({ error: 'Nombre es requerido' });
    const updated = await AdminService.updateClientAsAdmin(id, { name, email, active });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Controller Error - updateClient:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/dashboard', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const stats = AdminService.getAdminStats ? AdminService.getAdminStats() : {};
  stats.adminUser = req.user.username;
  res.json(stats);
});

router.patch('/clients/:id/status', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (active === undefined) return res.status(400).json({ error: 'Campo active es requerido (true/false)' });
    const updatedClient = await AdminService.toggleClientStatus(id, active);
    res.json(updatedClient);
  } catch (error) {
    console.error('Controller Error - toggleClientStatus:', error);
    res.status(400).json({ error: error.message });
  }
});

// Keep the advanced features but with simpler implementations
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

// New endpoint to call the gRPC service method getAdminInfo
router.get('/admin/:id', async (req, res) => {
  try {
    const adminId = req.params.id;
    const adminInfo = await AdminService.getAdminInfo(adminId);
    res.status(200).json(adminInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin info', details: error.message });
  }
});

module.exports = router;