// Componente Clients - Servicio de gestión de clientes
const IClientsService = require('./IClientsService');

// Datos hardcodeados internos del módulo de clientes
const clientsData = [
  { id: 1, name: 'Cliente Uno' },
  { id: 2, name: 'Cliente Dos' },
  { id: 3, name: 'Cliente Tres' },
  { id: 4, name: 'Cliente Cuatro' }
];

class ClientsService extends IClientsService {
  constructor() {
    super();
    // Pasar los datos específicos de clientes a la clase base
    this.data = clientsData;
  }

  getAll() {
    // Usar implementación de la clase base
    return super.getAll();
  }

  getById(id) {
    // Usar implementación de la clase base que busca en this.data
    return super.getById(id);
  }

  create(data) {
    const newClient = {
      id: Date.now(),
      name: data.name,
      email: data.email || `cliente${Date.now()}@example.com`,
      createdAt: new Date().toISOString()
    };
    // En un servicio sin estado, no persistimos realmente
    return newClient;
  }

  update(id, data) {
    // Usar implementación de la clase base
    return super.update(id, data);
  }

  delete(id) {
    // Usar implementación de la clase base
    return super.delete(id);
  }

  // Métodos específicos de clientes
  getByName(name) {
    return this.data.filter(c => 
      c.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}

// Crear y exportar instancia única del servicio
const clientsServiceInstance = new ClientsService();

module.exports = clientsServiceInstance;
module.exports.ClientsService = clientsServiceInstance;
module.exports.ClientsServiceClass = ClientsService;