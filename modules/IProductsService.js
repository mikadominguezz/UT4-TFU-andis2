// Clase base específica para productos
// Extiende IService y proporciona implementaciones por defecto para métodos específicos de productos
// Las clases derivadas pueden usar estas implementaciones o sobrescribirlas

const IService = require('./IService');

class IProductsService extends IService {
  constructor() {
    super();
  }

  // Métodos específicos para productos con implementaciones por defecto
  getByCategory(category) {
    // Implementación por defecto: busca productos por categoría
    if (!this.data || !Array.isArray(this.data)) {
      return [];
    }
    
    return this.data.filter(product => 
      product.category && 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }

  updatePrice(id, price) {
    // Implementación por defecto: actualiza solo el precio de un producto
    const product = this.getById(id);
    
    if (!product) {
      return null;
    }

    // Validar que el precio sea válido
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      throw new Error('El precio debe ser un número válido mayor o igual a 0');
    }

    const updatedProduct = {
      ...product,
      price: newPrice,
      updatedAt: new Date().toISOString()
    };

    return updatedProduct;
  }

  // Métodos auxiliares adicionales específicos para productos
  getByPriceRange(minPrice, maxPrice) {
    if (!this.data || !Array.isArray(this.data)) {
      return [];
    }

    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Infinity;

    return this.data.filter(product => 
      product.price >= min && product.price <= max
    );
  }

  getCategories() {
    if (!this.data || !Array.isArray(this.data)) {
      return [];
    }

    // Obtener categorías únicas
    const categories = this.data
      .filter(product => product.category)
      .map(product => product.category)
      .filter((category, index, array) => array.indexOf(category) === index);

    return categories.sort();
  }

  searchByName(searchTerm) {
    if (!this.data || !Array.isArray(this.data)) {
      return [];
    }

    return this.data.filter(product =>
      product.name && 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

module.exports = IProductsService;