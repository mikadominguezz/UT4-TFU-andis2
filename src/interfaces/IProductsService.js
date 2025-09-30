const IService = require('./IService');
class IProductsService extends IService {
  constructor() { super(); }
  updatePrice(id, price) { const product = this.getById(id); if (!product) return null; const newPrice = parseFloat(price); if (isNaN(newPrice) || newPrice < 0) throw new Error('El precio debe ser un número válido mayor o igual a 0'); const updatedProduct = { ...product, price: newPrice, updatedAt: new Date().toISOString() }; return updatedProduct; }
  searchByName(searchTerm) { if (!this.data || !Array.isArray(this.data)) return []; return this.data.filter(product => product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())); }
}
module.exports = IProductsService;
