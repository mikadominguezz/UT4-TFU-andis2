const IService = require('./IService');

class IClientsService extends IService {

  
  getByName(name) {
    throw new Error('IClientsService.getByName() debe ser implementado');
  }

  getByEmail(email) {
    throw new Error('IClientsService.getByEmail() debe ser implementado');
  }

  searchClients(searchTerm) {
    throw new Error('IClientsService.searchClients() debe ser implementado');
  }

  

  getActiveClients() {
    throw new Error('IClientsService.getActiveClients() debe ser implementado');
  }

  getClientsByDateRange(startDate, endDate) {
    throw new Error('IClientsService.getClientsByDateRange() debe ser implementado');
  }

  

  getClientStats() {
    throw new Error('IClientsService.getClientStats() debe ser implementado');
  }
}
IClientsService.METADATA = {
  ...IService.METADATA,
  domain: 'clients',
  entity: {
    name: 'Client',
    fields: {
      id: { type: 'number', required: true, unique: true },
      name: { type: 'string', required: true, minLength: 2 },
      email: { type: 'string', required: false, unique: true, format: 'email' },
      active: { type: 'boolean', default: true },
      createdAt: { type: 'string', format: 'iso-date', auto: true }
    }
  },
  indices: ['name', 'email', 'active', 'createdAt'],
  businessRules: [
    'Email debe ser único si se proporciona',
    'Nombre es requerido y mínimo 2 caracteres',
    'Solo clientes activos pueden realizar transacciones'
  ],
  searchCapabilities: {
    byName: 'partial-match',
    byEmail: 'exact-match',
    global: 'multi-field'
  }
};

module.exports = IClientsService;
