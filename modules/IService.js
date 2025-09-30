// Clase base para servicios CRUD
// Proporciona implementaciones por defecto que pueden ser sobrescritas por las clases derivadas
// Patrón similar a clases abstractas en C# pero con implementaciones concretas

class IService {
  constructor() {
    // Array de datos por defecto - las clases derivadas pueden sobrescribir esto
    this.data = [];
  }

  getAll() {
    // Implementación por defecto: retorna todos los elementos
    return this.data;
  }

  getById(id) {
    // Implementación por defecto: busca por ID
    const item = this.data.find(item => item.id == id);
    if (item) {
      return item;
    }
    
    // Si no se encuentra, retorna un elemento genérico
    return {
      id: parseInt(id),
      name: `Item ${id}`,
      createdAt: new Date().toISOString()
    };
  }

  create(data) {
    // Implementación por defecto: crea un nuevo elemento
    const newItem = {
      id: Date.now(), // ID único basado en timestamp
      ...data,
      createdAt: new Date().toISOString()
    };
    
    // En una implementación real, aquí se persistiría
    // Por ahora solo retornamos el objeto creado
    return newItem;
  }

  update(id, data) {
    // Implementación por defecto: actualiza un elemento
    const existingItem = this.getById(id);
    const updatedItem = {
      ...existingItem,
      ...data,
      id: parseInt(id), // Mantener el ID original
      updatedAt: new Date().toISOString()
    };
    
    return updatedItem;
  }

  delete(id) {
    // Implementación por defecto: marca como eliminado
    const item = this.getById(id);
    if (item) {
      return {
        id: parseInt(id),
        deleted: true,
        deletedAt: new Date().toISOString(),
        message: `Item ${id} marcado como eliminado`
      };
    }
    
    throw new Error(`Item con ID ${id} no encontrado`);
  }

  // Métodos auxiliares adicionales
  count() {
    return this.data.length;
  }

  exists(id) {
    return this.data.some(item => item.id == id);
  }

  clear() {
    this.data = [];
    return { message: 'Todos los datos han sido limpiados' };
  }
}

module.exports = IService;