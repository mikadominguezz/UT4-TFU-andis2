const IClientsService = require('../interfaces/IClientsService');

const clientsData = [
  { id: 1, name: 'Cliente Uno' },
  { id: 2, name: 'Cliente Dos' },
  { id: 3, name: 'Cliente Tres' },
  { id: 4, name: 'Cliente Cuatro' }
];

class ClientsService extends IClientsService {
  constructor() {
    super();
    this.data = clientsData;
  }

  getById(id) {
    return super.getById(id);
  }

  update(id, data) {
    return super.update(id, data);
  }

  getByName(name) {
    return this.data.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
  }
}

const clientsServiceInstance = new ClientsService();

module.exports = clientsServiceInstance;
module.exports.ClientsService = clientsServiceInstance;
module.exports.ClientsServiceClass = ClientsService;
