require('dotenv').config();

const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'Product API is healthy' });
});

module.exports = router;