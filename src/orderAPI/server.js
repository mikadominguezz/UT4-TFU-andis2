const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/orders', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to Orders Database'))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.get('/', (req, res) => res.send('Orders Service Running'));

app.listen(PORT, () => console.log(`Orders Service running on port ${PORT}`));