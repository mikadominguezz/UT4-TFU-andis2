const Product = require('../schema/ProductSchema');

class ProductsRepository {
  async getProducts() {
    try {
      return await Product.find();
    } catch (error) {
      console.error('Error fetching products from database:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      return await Product.findById(id);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  async saveProduct(productData) {
    try {
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      console.error('Error saving product to database:', error);
      throw error;
    }
  }
}

module.exports = new ProductsRepository();