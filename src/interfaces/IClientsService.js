const IService = require('./IService');

class IClientsService extends IService {

  
  getByName(name) {
    return this.data.filter(client =>
      client.name.toLowerCase().includes(name.toLowerCase()) && !client.deleted
    );
  }

  searchClients(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.data.filter(client =>
      (client.name.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term)) &&
      !client.deleted
    );
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
