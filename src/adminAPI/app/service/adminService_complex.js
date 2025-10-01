const AdminRepository = require('../repository/adminRepository');

class AdminService {
  
  async getAllClientsWithDetails() {
    try {
      return await AdminRepository.getAllClients();
    } catch (error) {
      console.error('Service Error - getAllClientsWithDetails:', error);
      throw new Error('Unable to fetch clients');
    }
  }

  async getActiveClients() {
    try {
      return await AdminRepository.getActiveClients();
    } catch (error) {
      console.error('Service Error - getActiveClients:', error);
      throw new Error('Unable to fetch active clients');
    }
  }

  async getInactiveClients() {
    try {
      return await AdminRepository.getInactiveClients();
    } catch (error) {
      console.error('Service Error - getInactiveClients:', error);
      throw new Error('Unable to fetch inactive clients');
    }
  }

  async getClientById(id) {
    try {
      const client = await AdminRepository.getClientById(id);
      if (!client) {
        throw new Error('Client not found');
      }
      return client;
    } catch (error) {
      console.error('Service Error - getClientById:', error);
      throw error;
    }
  }

  async createClientAsAdmin(clientData) {
    try {
      // Validate required fields
      if (!clientData.name) {
        throw new Error('Name is required');
      }

      if (clientData.email) {
        // Check if email already exists
        const existingClients = await AdminRepository.searchClients(clientData.email);
        const emailExists = existingClients.some(client => client.email === clientData.email);
        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      return await AdminRepository.createClientAsAdmin(clientData);
    } catch (error) {
      console.error('Service Error - createClientAsAdmin:', error);
      throw error;
    }
  }

  async updateClient(id, updateData) {
    try {
      return await AdminRepository.updateClient(id, updateData);
    } catch (error) {
      console.error('Service Error - updateClient:', error);
      throw error;
    }
  }

  async activateClient(id) {
    try {
      return await AdminRepository.activateClient(id);
    } catch (error) {
      console.error('Service Error - activateClient:', error);
      throw error;
    }
  }

  async deactivateClient(id) {
    try {
      return await AdminRepository.deactivateClient(id);
    } catch (error) {
      console.error('Service Error - deactivateClient:', error);
      throw error;
    }
  }

  async getClientStats() {
    try {
      return await AdminRepository.getClientStats();
    } catch (error) {
      console.error('Service Error - getClientStats:', error);
      throw new Error('Unable to fetch client statistics');
    }
  }

  async searchClients(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('Search term is required');
      }
      return await AdminRepository.searchClients(searchTerm.trim());
    } catch (error) {
      console.error('Service Error - searchClients:', error);
      throw error;
    }
  }
}

module.exports = new AdminService();