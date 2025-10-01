require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// 🚀 conexión a Mongo
mongoose.connect("mongodb://mongodb:27017/techmart", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: "admin",
  user: "admin",
  pass: "techmart2025"
})
.then(() => console.log("✅ Conectado a MongoDB (productsAPI)"))
.catch(err => console.error("❌ Error conectando a MongoDB:", err));

app.get('/products', (req, res) => {
  res.json({ message: "Productos funcionando!" });
});

app.listen(3001, () => {
  console.log("Products Service running on port 3001");
});
