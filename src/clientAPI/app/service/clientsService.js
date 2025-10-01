const ClientsRepository = require('../repository/clientsRepository');

class ClientsService {
  
  async getClients() {
    try {
      return await ClientsRepository.getClients();
    } catch (error) {
      console.error('Service Error - getClients:', error);
      throw new Error('Unable to fetch clients');
    }
  }

  async getClientById(id) {
    try {
      const client = await ClientsRepository.getClientById(id);
      if (!client) {
        throw new Error('Client not found');
      }
      return client;
    } catch (error) {
      console.error('Service Error - getClientById:', error);
      throw error;
    }
  }

  async getClientsByName(name) {
    try {
      return await ClientsRepository.getClientsByName(name);
    } catch (error) {
      console.error('Service Error - getClientsByName:', error);
      throw new Error('Unable to search clients by name');
    }
  }

  async getActiveClients() {
    try {
      return await ClientsRepository.getActiveClients();
    } catch (error) {
      console.error('Service Error - getActiveClients:', error);
      throw new Error('Unable to fetch active clients');
    }
  }

  async saveClient(clientData) {
    try {
      // Validate required fields
      if (!clientData.name || !clientData.email) {
        throw new Error('Name and email are required');
      }

      // Check if email already exists
      const existingClient = await ClientsRepository.getClientByEmail(clientData.email);
      if (existingClient) {
        throw new Error('Email already exists');
      }

      return await ClientsRepository.saveClient(clientData);
    } catch (error) {
      console.error('Service Error - saveClient:', error);
      throw error;
    }
  }

  async getClientStats() {
    try {
      return await ClientsRepository.getClientStats();
    } catch (error) {
      console.error('Service Error - getClientStats:', error);
      throw new Error('Unable to fetch client statistics');
    }
  }

  // Legacy methods for backward compatibility
  getById(id) {
    // Convert to sync-like interface for existing code
    return this.getClientById(id).catch(() => null);
  }

  getByName(name) {
    // Convert to sync-like interface for existing code  
    return this.getClientsByName(name).catch(() => []);
  }
}

module.exports = new ClientsService();