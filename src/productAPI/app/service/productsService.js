const ProductsRepository = require('../repository/productsRepository');

class ProductsService {
  constructor(productsRepository) {
    this.productsRepository = productsRepository;
  }

  async getProducts() {
    console.log('🔍 ProductsService.getProducts() llamado');
    const products = await this.productsRepository.getProducts();
    console.log('📦 Productos obtenidos:', products.length);
    return products;
  }

  async getProductById(id) {
    console.log('🔍 ProductsService.getProductById() llamado con ID:', id);
    const product = await this.productsRepository.getProductById(id);
    console.log('📦 Producto obtenido:', product ? 'encontrado' : 'no encontrado');
    return product;
  }

  async saveProduct(productData) {
    console.log('🔍 ProductsService.saveProduct() llamado con datos:', productData);
    const savedProduct = await this.productsRepository.saveProduct(productData);
    console.log('📦 Producto guardado:', savedProduct);
    return savedProduct;
  }
}

module.exports = new ProductsService(ProductsRepository);