class IService {
  constructor() {
    this.data = [];
  }

  getAll() {
    return this.data.filter(item => !item.deleted);
  }

  getById(id) {
    if (!id) {
      throw new Error('ValidationError: ID es requerido');
    }
    return this.data.find(item => item.id === id && !item.deleted) || null;
  }

  create(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('ValidationError: Data es requerido y debe ser un objeto');
    }
    const newItem = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      deleted: false
    };
    this.data.push(newItem);
    return newItem;
  }

  update(id, data) {
    if (!id) {
      throw new Error('ValidationError: ID es requerido');
    }
    const itemIndex = this.data.findIndex(item => item.id === id && !item.deleted);
    if (itemIndex === -1) {
      throw new Error(`NotFoundError: Item con ID ${id} no encontrado`);
    }
    this.data[itemIndex] = { ...this.data[itemIndex], ...data, updatedAt: new Date().toISOString() };
    return this.data[itemIndex];
  }

  delete(id) {
    const itemIndex = this.data.findIndex(item => item.id === id && !item.deleted);
    if (itemIndex === -1) {
      throw new Error(`NotFoundError: Item con ID ${id} no encontrado`);
    }
    this.data[itemIndex].deleted = true;
    this.data[itemIndex].deletedAt = new Date().toISOString();
    return this.data[itemIndex];
  }

  count() {
    return this.data.filter(item => !item.deleted).length;
  }

  exists(id) {
    return this.data.some(item => item.id === id && !item.deleted);
  }

  clear() {
    const clearedData = this.data.filter(item => !item.deleted);
    this.data = [];
    return clearedData.length;
  }
}

IService.METADATA = {
  version: '1.0.0',
  permissions: {
    read: ['user', 'admin'],
    write: ['admin'],
    delete: ['admin']
  },
  sla: {
    maxResponseTime: 200,
    availability: 99.9
  },
  dataFormats: ['application/json'],
  errors: {
    ValidationError: 'Datos de entrada inválidos',
    NotFoundError: 'Recurso no encontrado',
    PermissionError: 'Permisos insuficientes'
  }
};

module.exports = IService;
