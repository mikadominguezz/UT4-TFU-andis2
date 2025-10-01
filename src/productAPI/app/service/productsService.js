const ProductsRepository = require('../repository/productsRepository');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = '/app/proto/product.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(packageDefinition).ProductService;

const client = new productProto('localhost:50054', grpc.credentials.createInsecure());

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

  getProductInfo(productId) {
    return new Promise((resolve, reject) => {
      client.GetProductInfo({ product_id: productId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

module.exports = new ProductsService(ProductsRepository);