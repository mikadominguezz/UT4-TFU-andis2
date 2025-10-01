class ProductsService {
  constructor(productsRepository) {
    this.productsRepository = productsRepository;
  }

  async getProducts() {
    const products = await this.productsRepository.getProducts();
    return products;
  }

  async getProductById(id) {
    const product = await this.productsRepository.getProductById(id);
    return product;
  }

  async saveProduct(productData) {
    const savedProduct = await this.productsRepository.saveProduct(productData);
    return savedProduct;
  }
}

module.exports = ProductsService;