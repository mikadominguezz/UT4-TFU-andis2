const IService = require('./IService');
class IProductsService extends IService {
  constructor() { super(); }
  getByCategory(category) { if (!this.data || !Array.isArray(this.data)) return []; return this.data.filter(product => product.category && product.category.toLowerCase() === category.toLowerCase()); }
  updatePrice(id, price) { const product = this.getById(id); if (!product) return null; const newPrice = parseFloat(price); if (isNaN(newPrice) || newPrice < 0) throw new Error('El precio debe ser un número válido mayor o igual a 0'); const updatedProduct = { ...product, price: newPrice, updatedAt: new Date().toISOString() }; return updatedProduct; }
  getByPriceRange(minPrice, maxPrice) { if (!this.data || !Array.isArray(this.data)) return []; const min = parseFloat(minPrice) || 0; const max = parseFloat(maxPrice) || Infinity; return this.data.filter(product => product.price >= min && product.price <= max); }
  getCategories() { if (!this.data || !Array.isArray(this.data)) return []; const categories = this.data.filter(product => product.category).map(product => product.category).filter((category, index, array) => array.indexOf(category) === index); return categories.sort(); }
  searchByName(searchTerm) { if (!this.data || !Array.isArray(this.data)) return []; return this.data.filter(product => product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())); }
}
module.exports = IProductsService;
