const Product = require('../models/Product');
const IProductsService = require('../interfaces/IProductsService');

class ProductsService extends IProductsService {
  constructor() {
    super();
  }

  async getAll() {
    try {
      const products = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();
      return products.map(p => ({ ...p, id: p._id.toString() }));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getById(id) {
    try {
      const product = await Product.findById(id).lean();
      if (product) {
        await Product.findByIdAndUpdate(id, { $inc: { 'metadata.views': 1 } });
        return { ...product, id: product._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error getting product by id:', error);
      return null;
    }
  }

  async create(data) {
    try {
      const productData = {
        name: data.name,
        price: parseFloat(data.price) || 0,
        description: data.description || '',
        category: data.category || 'General',
        stock: data.stock || 0,
        image: data.image || '',
        tags: data.tags || []
      };

      const product = new Product(productData);
      const saved = await product.save();
      return { ...saved.toObject(), id: saved._id.toString() };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Error creating product');
    }
  }

  async update(id, data) {
    try {
      const updated = await Product.findByIdAndUpdate(
        id, 
        { ...data, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      ).lean();
      
      if (updated) {
        return { ...updated, id: updated._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Error updating product');
    }
  }

  async delete(id) {
    try {
      const result = await Product.findByIdAndUpdate(
        id, 
        { isActive: false, deletedAt: new Date() }
      );
      return !!result;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async getByCategory(category) {
    try {
      const products = await Product.find({ 
        category: new RegExp(category, 'i'),
        isActive: true 
      }).lean();
      return products.map(p => ({ ...p, id: p._id.toString() }));
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  async updatePrice(id, price) {
    try {
      const updated = await Product.findByIdAndUpdate(
        id,
        { price: parseFloat(price), updatedAt: new Date() },
        { new: true }
      ).lean();
      
      if (updated) {
        return { ...updated, id: updated._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error updating price:', error);
      return null;
    }
  }

  async getByPriceRange(minPrice, maxPrice) {
    try {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Number.MAX_SAFE_INTEGER;
      
      const products = await Product.find({
        price: { $gte: min, $lte: max },
        isActive: true
      }).lean();
      
      return products.map(p => ({ ...p, id: p._id.toString() }));
    } catch (error) {
      console.error('Error getting products by price range:', error);
      return [];
    }
  }

  async searchProducts(query) {
    try {
      const products = await Product.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: new RegExp(query, 'i') },
              { description: new RegExp(query, 'i') },
              { category: new RegExp(query, 'i') },
              { tags: { $in: [new RegExp(query, 'i')] } }
            ]
          }
        ]
      }).lean();
      
      return products.map(p => ({ ...p, id: p._id.toString() }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async getCategories() {
    try {
      const categories = await Product.distinct('category', { isActive: true });
      return categories.sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async searchByName(searchTerm) {
    try {
      const products = await Product.find({
        name: new RegExp(searchTerm, 'i'),
        isActive: true
      }).lean();
      return products.map(p => ({ ...p, id: p._id.toString() }));
    } catch (error) {
      console.error('Error searching by name:', error);
      return [];
    }
  }

  async count() {
    try {
      return await Product.countDocuments({ isActive: true });
    } catch (error) {
      console.error('Error counting products:', error);
      return 0;
    }
  }

  async exists(id) {
    try {
      const product = await Product.findById(id);
      return !!product && product.isActive;
    } catch (error) {
      console.error('Error checking product existence:', error);
      return false;
    }
  }

  async clear() {
    try {
      const previousCount = await this.count();
      await Product.updateMany({}, { isActive: false, deletedAt: new Date() });

      return {
        message: 'Todos los productos han sido desactivados',
        previousCount,
        clearedAt: new Date().toISOString(),
        operation: 'clear-products'
      };
    } catch (error) {
      console.error('Error clearing products:', error);
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
