// Módulo de clientes
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../auth');

// Simulación de servicios sin estado: los datos se obtienen de la interfaz
const { ClientsInterface } = require('./interfaces');

const SECRET = process.env.JWT_SECRET;

// Obtener todos los clientes (solo admins)
router.get('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(ClientsInterface.getAll());
});

// Crear cliente (solo admins)
router.post('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }
  // En un servicio sin estado, la creación no modifica el estado local
  const newClient = { id: Date.now(), name };
  res.status(201).json(newClient);
});

module.exports = router;
