require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const ProductsService = require("../service/productsService");
const router = express.Router();

// Middleware de autenticación JWT
function authenticateJWT(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Middleware de autorización
function authorizeRoles(roles) {
  return (req, res, next) => {
    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res
        .status(403)
        .json({ error: `Se requiere rol: ${roles.join(" o ")}` });
    }
    next();
  };
}

// Datos hardcodeados para pruebas
const products = [
  {
    name: "Laptop Gaming",
    price: 1500,
    description: "Laptop gaming",
    category: "Electronics",
  },
  {
    name: "Mouse Inalámbrico",
    price: 50,
    description: "Mouse inalámbrico",
    category: "Electronics",
  },
  {
    name: "Teclado Mecánico",
    price: 120,
    description: "Teclado mecánico",
    category: "Electronics",
  },
];

// Seed de datos iniciales
async function seedProducts() {
  try {
    const existingProducts = await ProductsService.getProducts();
    if (existingProducts.length === 0) {
      console.log("Agregando productos iniciales...");
      for (const product of products) {
        await ProductsService.saveProduct(product);
      }
      console.log("Productos agregados correctamente");
    }
  } catch (error) {
    console.error("Error agregando los productos:", error);
  }
}

// Seed on startup
seedProducts();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({ status: "Product API is healthy" });
});

// GET /products - Obtener todos los productos
router.get("/products", authenticateJWT, async (req, res) => {
  try {
    console.log(
      `Products API: Usuario ${req.user.username} consultando productos`,
    );
    const products = await ProductsService.getProducts();
    res.json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// POST /products - Crear producto (solo admin)
router.post(
  "/products",
  authenticateJWT,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { name, price, description, category } = req.body;

      if (!name || !price) {
        return res.status(400).json({ error: "Name y price son requeridos" });
      }

      const productData = {
        name,
        price: parseFloat(price),
        description: description || "Sin descripción",
        category: category || "General",
      };

      const newProduct = await ProductsService.saveProduct(productData);
      console.log(
        `Products API: Admin ${req.user.username} creó producto: ${name}`,
      );

      res.status(201).json({
        message: "Producto creado exitosamente",
        product: newProduct,
      });
    } catch (error) {
      console.error("❌ Error al crear producto:", error);
      res.status(500).json({ error: "Error al crear producto" });
    }
  },
);

// PUT /products/:id - Modificar producto (solo admin)
router.put(
  "/products/:id",
  authenticateJWT,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const productId = req.params.id.replace("p", ""); // Manejar tanto "1" como "p1"
      const { name, price, description, category } = req.body;

      const existingProduct = await ProductsService.getProductById(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (price) updateData.price = parseFloat(price);
      if (description) updateData.description = description;
      if (category) updateData.category = category;

      const updatedProduct = await ProductsService.updateProduct(
        productId,
        updateData,
      );
      console.log(
        `Products API: Admin ${req.user.username} modificó producto ID ${productId}`,
      );

      res.json({
        message: "Producto modificado exitosamente",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("❌ Error al modificar producto:", error);
      res.status(500).json({ error: "Error al modificar producto" });
    }
  },
);

// GET /products/:id - Obtener producto específico
router.get("/products/:id", authenticateJWT, async (req, res) => {
  try {
    const productId = req.params.id.replace("p", "");
    const product = await ProductsService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error al obtener producto:", error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

module.exports = router;
