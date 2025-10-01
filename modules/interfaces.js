class IService {
  getAll() {
    throw new Error('Método getAll() debe ser implementado por la clase derivada');
  }

  getById(id) {
    throw new Error('Método getById() debe ser implementado por la clase derivada');
  }

  create(data) {
    throw new Error('Método create() debe ser implementado por la clase derivada');
  }

  update(id, data) {
    throw new Error('Método update() debe ser implementado por la clase derivada');
  }

  delete(id) {
    throw new Error('Método delete() debe ser implementado por la clase derivada');
  }
}
class IProductsService extends IService {
  constructor() {
    super();
  }

  
  getByCategory(category) {
    throw new Error('Método getByCategory() debe ser implementado por la clase derivada');
  }

  updatePrice(id, price) {
    throw new Error('Método updatePrice() debe ser implementado por la clase derivada');
  }
}
class IClientsService extends IService {
  constructor() {
    super();
  }

  
  getByName(name) {
    throw new Error('Método getByName() debe ser implementado por la clase derivada');
  }
}
class IOrdersService extends IService {
  constructor() {
    super();
  }

  
  getByClientId(clientId) {
    throw new Error('Método getByClientId() debe ser implementado por la clase derivada');
  }

  getByDateRange(startDate, endDate) {
    throw new Error('Método getByDateRange() debe ser implementado por la clase derivada');
  }

  calculateTotal(productIds) {
    throw new Error('Método calculateTotal() debe ser implementado por la clase derivada');
  }
}

module.exports = { 
  IService,
  IProductsService,
  IClientsService,
  IOrdersService
};
