const ProductsRepository = require('../repository/productsRepository');

class ProductsService {

  async getProducts() {
    const products = await ProductsRepository.getProducts();
    return products;
  }

  async getProductById(id) {
    const product = await ProductsRepository.getProductById(id);
    return product;
  }

  async saveProduct(productData) {
    const savedProduct = await ProductsRepository.saveProduct(productData);
    return savedProduct;
  }
}

module.exports = ProductsService;