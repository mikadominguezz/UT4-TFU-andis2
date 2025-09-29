// Módulo de clientes
const express = require('express');
const router = express.Router();

// Simulación de servicios sin estado: los datos se obtienen de la interfaz
const { ClientsInterface } = require('./interfaces');

// Obtener todos los clientes
router.get('/', (req, res) => {
  res.json(ClientsInterface.getAll());
});

// Crear cliente (solo simula la creación, no persiste)
router.post('/', (req, res) => {
  const { name } = req.body;
  // En un servicio sin estado, la creación no modifica el estado local
  const newClient = { id: Date.now(), name };
  res.status(201).json(newClient);
});

module.exports = router;
