db = db.getSiblingDB('techmart_ut4');

db.products.deleteMany({});
db.clients.deleteMany({});
db.orders.deleteMany({});

db.products.insertMany([
  {
    name: "iPhone 15 Pro",
    price: 999.99,
    description: "El último iPhone con chip A17 Pro, cámara de 48MP y titanio.",
    category: "Smartphones",
    stock: 25,
    image: "https://via.placeholder.com/300x300?text=iPhone+15+Pro",
    tags: ["apple", "smartphone", "5g", "premium"],
    isActive: true,
    metadata: { views: 150, sales: 12, rating: 4.8, reviews: 45 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    price: 899.99,
    description: "Smartphone premium con S Pen integrado y cámara de 200MP.",
    category: "Smartphones",
    stock: 18,
    image: "https://via.placeholder.com/300x300?text=Galaxy+S24",
    tags: ["samsung", "smartphone", "s-pen", "camera"],
    isActive: true,
    metadata: { views: 120, sales: 8, rating: 4.7, reviews: 32 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "MacBook Pro 14\"",
    price: 1999.99,
    description: "Laptop profesional con chip M3 Pro, 18GB RAM y pantalla Liquid Retina XDR.",
    category: "Laptops",
    stock: 12,
    image: "https://via.placeholder.com/300x300?text=MacBook+Pro",
    tags: ["apple", "laptop", "m3", "professional"],
    isActive: true,
    metadata: { views: 200, sales: 6, rating: 4.9, reviews: 28 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Dell XPS 13",
    price: 1299.99,
    description: "Ultrabook compacta con procesador Intel Core i7 de 13ª generación.",
    category: "Laptops",
    stock: 15,
    image: "https://via.placeholder.com/300x300?text=Dell+XPS+13",
    tags: ["dell", "ultrabook", "intel", "portable"],
    isActive: true,
    metadata: { views: 90, sales: 4, rating: 4.5, reviews: 18 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "iPad Air",
    price: 599.99,
    description: "Tablet versátil con chip M1 y compatibilidad con Apple Pencil.",
    category: "Tablets",
    stock: 30,
    image: "https://via.placeholder.com/300x300?text=iPad+Air",
    tags: ["apple", "tablet", "m1", "creative"],
    isActive: true,
    metadata: { views: 180, sales: 15, rating: 4.6, reviews: 52 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sony WH-1000XM5",
    price: 349.99,
    description: "Auriculares inalámbricos con cancelación de ruido líder en la industria.",
    category: "Audio",
    stock: 40,
    image: "https://via.placeholder.com/300x300?text=Sony+WH1000XM5",
    tags: ["sony", "headphones", "noise-cancelling", "wireless"],
    isActive: true,
    metadata: { views: 220, sales: 25, rating: 4.8, reviews: 89 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Nintendo Switch OLED",
    price: 349.99,
    description: "Consola híbrida con pantalla OLED de 7 pulgadas y colores vibrantes.",
    category: "Gaming",
    stock: 22,
    image: "https://via.placeholder.com/300x300?text=Switch+OLED",
    tags: ["nintendo", "gaming", "console", "oled"],
    isActive: true,
    metadata: { views: 300, sales: 18, rating: 4.7, reviews: 76 },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Samsung 4K Smart TV 55\"",
    price: 699.99,
    description: "Smart TV 4K UHD con tecnología QLED y sistema operativo Tizen.",
    category: "TV & Home",
    stock: 8,
    image: "https://via.placeholder.com/300x300?text=Samsung+TV+55",
    tags: ["samsung", "tv", "4k", "smart", "qled"],
    isActive: true,
    metadata: { views: 140, sales: 3, rating: 4.4, reviews: 21 },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.clients.insertMany([
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    username: "alice",
    phone: "+1-555-0123",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    preferences: {
      categories: ["Smartphones", "Audio"],
      priceRange: { min: 100, max: 1000 },
      notifications: { email: true, sms: false }
    },
    isActive: true,
    metadata: {
      totalOrders: 3,
      totalSpent: 1249.97,
      lastLogin: new Date(),
      registrationSource: "web"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Bob Smith",
    email: "bob@example.com",
    username: "bob",
    phone: "+1-555-0456",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    preferences: {
      categories: ["Laptops", "Gaming"],
      priceRange: { min: 500, max: 3000 },
      notifications: { email: true, sms: true }
    },
    isActive: true,
    metadata: {
      totalOrders: 2,
      totalSpent: 2349.98,
      lastLogin: new Date(),
      registrationSource: "mobile"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Maria García",
    email: "maria@example.com",
    username: "maria",
    phone: "+52-555-0789",
    address: {
      street: "789 Reforma Ave",
      city: "Ciudad de México",
      state: "CDMX",
      zipCode: "06600",
      country: "México"
    },
    preferences: {
      categories: ["Tablets", "TV & Home"],
      priceRange: { min: 200, max: 1500 },
      notifications: { email: true, sms: false }
    },
    isActive: true,
    metadata: {
      totalOrders: 1,
      totalSpent: 599.99,
      lastLogin: new Date(),
      registrationSource: "social"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("✅ Datos de ejemplo insertados correctamente:");
print("📱 Productos:", db.products.countDocuments());
print("👥 Clientes:", db.clients.countDocuments());