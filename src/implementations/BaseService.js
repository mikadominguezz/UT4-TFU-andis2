const IService = require('../interfaces/IService');

class BaseService extends IService {
  constructor() {
    super();
    this.data = [];
    this.lastOperationStatus = null;
  }

  getAll() {
    try {
      this.lastOperationStatus = { success: true, operation: 'getAll', timestamp: new Date().toISOString() };
      return this.data.filter(item => !item.deleted);
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'getAll', error: error.message };
      throw error;
    }
  }

  getById(id) {
    try {
      if (!id) {
        throw new Error('ValidationError: ID es requerido');
      }

      const item = this.data.find(item => item.id == id && !item.deleted);
      this.lastOperationStatus = {
        success: true,
        operation: 'getById',
        found: !!item,
        timestamp: new Date().toISOString()
      };

      return item || null;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'getById', error: error.message };
      throw error;
    }
  }

  create(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('ValidationError: Data es requerido y debe ser un objeto');
      }

      const newItem = {
        id: this.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        deleted: false
      };

      
      this.validateForCreate(newItem);

      this.data.push(newItem);

      this.lastOperationStatus = { 
        success: true,
        operation: 'create',
        id: newItem.id,
        timestamp: new Date().toISOString()
      };

      
      this.emitEvent('created', newItem);

      return newItem;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'create', error: error.message };
      throw error;
    }
  }

  update(id, data) {
    try {
      if (!id) {
        throw new Error('ValidationError: ID es requerido');
      }
      if (!data || typeof data !== 'object') {
        throw new Error('ValidationError: Data es requerido');
      }

      const existingItem = this.getById(id);
      if (!existingItem) {
        throw new Error(`NotFoundError: Item con ID ${id} no encontrado`);
      }

      const updatedItem = {
        ...existingItem,
        ...data,
        id: parseInt(id),
        updatedAt: new Date().toISOString()
      };

      
      this.validateForUpdate(updatedItem);

      
      const index = this.data.findIndex(item => item.id == id);
      this.data[index] = updatedItem;

      this.lastOperationStatus = { 
        success: true,
        operation: 'update',
        id: updatedItem.id,
        timestamp: new Date().toISOString()
      };

      this.emitEvent('updated', { before: existingItem, after: updatedItem });

      return updatedItem;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'update', error: error.message };
      throw error;
    }
  }

  delete(id) {
    try {
      if (!id) {
        throw new Error('ValidationError: ID es requerido');
      }

      const item = this.getById(id);
      if (!item) {
        throw new Error(`NotFoundError: Item con ID ${id} no encontrado`);
      }

      
      const index = this.data.findIndex(i => i.id == id);
      this.data[index] = {
        ...this.data[index],
        deleted: true,
        deletedAt: new Date().toISOString()
      };

      const result = {
        id: parseInt(id),
        deleted: true,
        deletedAt: this.data[index].deletedAt,
        message: `Item ${id} marcado como eliminado`
      };

      this.lastOperationStatus = { 
        success: true,
        operation: 'delete',
        id: parseInt(id),
        timestamp: new Date().toISOString()
      };

      this.emitEvent('deleted', result);

      return result;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'delete', error: error.message };
      throw error;
    }
  }

  count() {
    try {
      const count = this.data.filter(item => !item.deleted).length;
      this.lastOperationStatus = {
        success: true,
        operation: 'count',
        count,
        timestamp: new Date().toISOString()
      };
      return count;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'count', error: error.message };
      return 0;
    }
  }

  exists(id) {
    try {
      const exists = this.data.some(item => item.id == id && !item.deleted);
      this.lastOperationStatus = {
        success: true,
        operation: 'exists',
        exists,
        timestamp: new Date().toISOString()
      };
      return exists;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'exists', error: error.message };
      return false;
    }
  }

  clear() {
    try {
      const previousCount = this.count();
      this.data = [];

      const result = {
        message: 'Todos los datos han sido limpiados',
        previousCount,
        clearedAt: new Date().toISOString()
      };

      this.lastOperationStatus = { 
        success: true,
        operation: 'clear',
        previousCount,
        timestamp: new Date().toISOString()
      };

      this.emitEvent('cleared', result);

      return result;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'clear', error: error.message };
      throw error;
    }
  }

  

  generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  validateForCreate(item) {

    return true;
  }

  validateForUpdate(item) {

    return true;
  }

  emitEvent(eventType, data) {

    console.log(`[EVENT] ${eventType}:`, JSON.stringify(data, null, 2));
  }

  getLastOperationStatus() {
    return this.lastOperationStatus;
  }
}

module.exports = BaseService;