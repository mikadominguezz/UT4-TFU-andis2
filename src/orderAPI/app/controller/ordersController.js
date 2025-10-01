require('dotenv').config();

const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Order API is healthy' });
});

module.exports = router;