require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const AdminService = require('../service/adminService');

const SECRET = process.env.JWT_SECRET;

// Basic admin endpoints for client management
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

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Admin API is healthy' });
});

module.exports = router;