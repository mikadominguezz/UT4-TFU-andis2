class IService {
  getAll() {
    throw new Error('IService.getAll() debe ser implementado por la clase concreta');
  }

  getById(id) {
    throw new Error('IService.getById() debe ser implementado por la clase concreta');
  }

  create(data) {
    throw new Error('IService.create() debe ser implementado por la clase concreta');
  }

  update(id, data) {
    throw new Error('IService.update() debe ser implementado por la clase concreta');
  }
  delete(id) {
    throw new Error('IService.delete() debe ser implementado por la clase concreta');
  }

  count() {
    throw new Error('IService.count() debe ser implementado por la clase concreta');
  }

  exists(id) {
    throw new Error('IService.exists() debe ser implementado por la clase concreta');
  }

  clear() {
    throw new Error('IService.clear() debe ser implementado por la clase concreta');
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
