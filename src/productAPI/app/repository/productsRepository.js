const Product = require('../schema/ProductSchema');

class ProductsRepository {
  async getProducts() {
    try {
      console.log('🔍 ProductsRepository.getProducts() ejecutando consulta...');
      const products = await Product.find();
      console.log('📦 Productos encontrados en BD:', products.length);
      console.log('📦 Primeros productos:', products.slice(0, 2));
      return products;
    } catch (error) {
      console.error('Error fetching products from database:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      console.log('🔍 ProductsRepository.getProductById() buscando ID:', id);
      const product = await Product.findById(id);
      console.log('📦 Producto encontrado:', product ? 'sí' : 'no');
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  async saveProduct(productData) {
    try {
      console.log('🔍 ProductsRepository.saveProduct() guardando:', productData);
      const product = new Product(productData);
      const saved = await product.save();
      console.log('📦 Producto guardado con ID:', saved._id);
      return saved;
    } catch (error) {
      console.error('Error saving product to database:', error);
      throw error;
    }
  }
}

module.exports = new ProductsRepository();