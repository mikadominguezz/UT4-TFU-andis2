require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const AdminService = require('../service/adminService');
const db = require('../database/database');

const SECRET = process.env.JWT_SECRET;

db.connect();

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
    const updated = await AdminService.updateClient(id, { name, email, isActive: active });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Controller Error - updateClient:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/dashboard', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const stats = await AdminService.getClientStats();
    stats.adminUser = req.user.username;
    res.json(stats);
  } catch (error) {
    console.error('Controller Error - getDashboard:', error);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

router.patch('/clients/:id/status', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (active === undefined) return res.status(400).json({ error: 'Campo active es requerido (true/false)' });
    
    const updatedClient = active 
      ? await AdminService.activateClient(id)
      : await AdminService.deactivateClient(id);
    
    res.json(updatedClient);
  } catch (error) {
    console.error('Controller Error - toggleClientStatus:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/clients/stats/summary', authenticateJWT(SECRET), authorizeRoles('admin'), async (req, res) => {
  try {
    const stats = await AdminService.getClientStats();
    res.json(stats);
  } catch (error) {
    console.error('Controller Error - getClientStats:', error);
    res.status(500).json({ error: 'Error fetching client statistics' });
  }
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Admin API is healthy' });
});

module.exports = router;