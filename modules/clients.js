// Módulo de clientes
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../auth');

const SECRET = process.env.JWT_SECRET;

// Datos hardcodeados internos del módulo de clientes
const clientsData = [
  { id: 1, name: 'Cliente Uno' },
  { id: 2, name: 'Cliente Dos' }
];

// Funciones internas para manejar clientes
const ClientsService = {
  getAll: () => clientsData,
  getById: (id) => {
    const client = clientsData.find(c => c.id == id);
    return client || { id: parseInt(id), name: `Cliente ${id}` };
  }
};

// Obtener todos los clientes (solo admins)
router.get('/', authenticateJWT(SECRET), authorizeRoles('admin'), (req, res) => {
  res.json(ClientsService.getAll());
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

// Exportar tanto el router como el servicio para uso interno
module.exports = router;
module.exports.ClientsService = ClientsService;
