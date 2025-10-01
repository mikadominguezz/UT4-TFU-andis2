const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://admin:techmart2025@mongodb:27017/admin?authSource=admin';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to Admin Database'))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.get('/', (req, res) => res.send('Admin Service Running'));

app.listen(PORT, () => console.log(`Admin Service running on port ${PORT}`));