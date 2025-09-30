const IProductsService = require('../interfaces/IProductsService');

const productsData = [
  { id: 1, name: 'Producto A', price: 100, category: 'electrónicos' },
  { id: 2, name: 'Producto B', price: 200, category: 'hogar' },
  { id: 3, name: 'Producto C', price: 150, category: 'electrónicos' },
  { id: 4, name: 'Producto D', price: 75, category: 'hogar' }
];

class ProductsService extends IProductsService {
  constructor() {
    super();
    this.data = productsData;
  }

  getAll() {
    return super.getAll();
  }

  getById(id) {
    const product = this.data.find(p => p.id == id);
    return product || { id: parseInt(id), name: `Producto ${id}`, price: 100 * id, category: 'general' };
  }

  create(data) {
    const newProduct = {
      id: Date.now(),
      name: data.name,
      price: data.price,
      category: data.category || 'general'
    };
    return newProduct;
  }

  update(id, data) {
    return super.update(id, data);
  }

  delete(id) {
    return super.delete(id);
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
}

const productsServiceInstance = new ProductsService();

module.exports = productsServiceInstance;
module.exports.ProductsService = productsServiceInstance;
module.exports.ProductsServiceClass = ProductsService;
