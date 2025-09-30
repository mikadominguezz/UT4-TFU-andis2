class IService {
  constructor() { this.data = []; }
  getAll() { return this.data; }
  getById(id) { const item = this.data.find(item => item.id == id); if (item) return item; return { id: parseInt(id), name: `Item ${id}`, createdAt: new Date().toISOString() }; }
  create(data) { const newItem = { id: Date.now(), ...data, createdAt: new Date().toISOString() }; return newItem; }
  update(id, data) { const existingItem = this.getById(id); const updatedItem = { ...existingItem, ...data, id: parseInt(id), updatedAt: new Date().toISOString() }; return updatedItem; }
  delete(id) { const item = this.getById(id); if (item) return { id: parseInt(id), deleted: true, deletedAt: new Date().toISOString(), message: `Item ${id} marcado como eliminado` }; throw new Error(`Item con ID ${id} no encontrado`); }
  count() { return this.data.length; }
  exists(id) { return this.data.some(item => item.id == id); }
  clear() { this.data = []; return { message: 'Todos los datos han sido limpiados' }; }
}

module.exports = IService;
