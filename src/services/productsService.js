const BaseService = require('../implementations/BaseService');
const IProductsService = require('../interfaces/IProductsService');

const productsData = [
  { id: 1, name: 'Producto A', price: 100, category: 'electrónicos' },
  { id: 2, name: 'Producto B', price: 200, category: 'hogar' },
  { id: 3, name: 'Producto C', price: 150, category: 'electrónicos' },
  { id: 4, name: 'Producto D', price: 75, category: 'hogar' }
];

class ProductsService extends BaseService {
  constructor() {
    super();

    this.data = productsData.map(product => ({
      ...product,
      deleted: false,
      createdAt: product.createdAt || new Date().toISOString()
    }));
  }

  
  create(data) {

    const productData = {
      ...data,
      category: data.category || 'general',
      price: parseFloat(data.price) || 0
    };

    return super.create(productData);
  }

  getByCategory(category) {
    return this.data.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
  }

  updatePrice(id, price) {
    const product = this.getById(id);
    if (product) {
      return { ...product, price };
    }
    return null;
  }

  getByPriceRange(minPrice, maxPrice) {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;
    return this.data.filter(product => product.price >= min && product.price <= max);
  }

  getCategories() {
    const categories = this.data.filter(product => product.category).map(product => product.category).filter((c, i, arr) => arr.indexOf(c) === i);
    return categories.sort();
  }

  searchByName(searchTerm) {
    if (!this.data || !Array.isArray(this.data)) return [];
    return this.data.filter(product => product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  

  count() {
    try {
      const count = this.data.filter(product => product && !product.deleted).length;
      return count;
    } catch (error) {
      console.error('Error counting products:', error.message);
      return 0;
    }
  }

  exists(id) {
    try {
      return this.data.some(product => product && product.id == id && !product.deleted);
    } catch (error) {
      console.error('Error checking product existence:', error.message);
      return false;
    }
  }

  

  clear() {
    try {
      const previousCount = this.count();
      this.data = [];

      const result = {
        message: 'Todos los productos han sido eliminados',
        previousCount,
        clearedAt: new Date().toISOString(),
        operation: 'clear-products'
      };

      console.log(`[PRODUCTS] Clear operation: ${previousCount} products removed`);
      return result;
    } catch (error) {
      console.error('Error clearing products:', error.message);
      throw error;
    }
  }

  

  validateForCreate(product) {
    if (!product.name || typeof product.name !== 'string' || product.name.trim().length < 2) {
      throw new Error('ValidationError: Nombre es requerido y debe tener al menos 2 caracteres');
    }

    if (product.price === undefined || product.price === null || isNaN(product.price) || product.price < 0) {
      throw new Error('ValidationError: Precio es requerido y debe ser un número mayor o igual a 0');
    }

    if (product.category && typeof product.category !== 'string') {
      throw new Error('ValidationError: Categoría debe ser una cadena de texto');
    }

    return true;
  }

  validateForUpdate(product) {
    return this.validateForCreate(product);
  }
}

const productsServiceInstance = new ProductsService();

module.exports = productsServiceInstance;
module.exports.ProductsService = productsServiceInstance;
module.exports.ProductsServiceClass = ProductsService;
