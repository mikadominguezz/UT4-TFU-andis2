const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3004;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://admin:techmart2025@mongodb:27017/techmart?authSource=admin';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to Orders Database'))
  .catch(err => console.error('Database connection error:', err));

// Routes
const ordersController = require('./app/controller/ordersController');
app.use('/orders', ordersController);

app.get('/', (req, res) => res.send('Orders Service Running'));

app.listen(PORT, () => console.log(`Orders Service running on port ${PORT}`));