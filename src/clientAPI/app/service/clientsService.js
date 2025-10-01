class ClientsService {
  constructor(clientsRepository) {
    this.clientsRepository = clientsRepository;
  }

  async getClients() {
    const clients = await this.clientsRepository.getClients();
    return clients;
  }

  async getClientById(id) {
    const client = await this.clientsRepository.getClientById(id);
    return client;
  }

  async saveClient(clientData) {
    const savedClient = await this.clientsRepository.saveClient(clientData);
    return savedClient;
  }
}

module.exports = ClientsService;