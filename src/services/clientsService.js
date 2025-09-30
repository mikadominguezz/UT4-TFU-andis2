const BaseService = require('../implementations/BaseService');
const IClientsService = require('../interfaces/IClientsService');

const clientsData = [
  { id: 1, name: 'Cliente Uno', email: 'cliente1@email.com', active: true, createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Cliente Dos', email: 'cliente2@email.com', active: true, createdAt: '2024-01-02T00:00:00Z' },
  { id: 3, name: 'Cliente Tres', email: 'cliente3@email.com', active: true, createdAt: '2024-01-03T00:00:00Z' },
  { id: 4, name: 'Cliente Cuatro', email: 'cliente4@email.com', active: false, createdAt: '2024-01-04T00:00:00Z' }
];

class ClientsService extends BaseService {
  constructor() {
    super();

    this.data = clientsData.map(client => ({
      ...client,
      deleted: false
    }));
  }

  

  getByName(name) {
    try {
      if (!name || typeof name !== 'string') {
        return [];
      }

      const results = this.data
        .filter(client =>
          !client.deleted &&
          client.name &&
          client.name.toLowerCase().includes(name.toLowerCase())
        );

      this.lastOperationStatus = { 
        success: true,
        operation: 'getByName',
        query: name,
        resultCount: results.length,
        timestamp: new Date().toISOString()
      };

      return results;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'getByName', error: error.message };
      throw error;
    }
  }

  getByEmail(email) {
    try {
      if (!email || typeof email !== 'string') {
        return null;
      }

      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('ValidationError: Formato de email inválido');
      }

      const client = this.data.find(client => 
        !client.deleted &&
        client.email &&
        client.email.toLowerCase() === email.toLowerCase()
      );

      this.lastOperationStatus = { 
        success: true,
        operation: 'getByEmail',
        query: email,
        found: !!client,
        timestamp: new Date().toISOString()
      };

      return client || null;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'getByEmail', error: error.message };
      throw error;
    }
  }

  searchClients(searchTerm) {
    try {
      if (!searchTerm || typeof searchTerm !== 'string') {
        return [];
      }

      const term = searchTerm.toLowerCase();
      const results = this.data.filter(client =>
        !client.deleted && (
          (client.name && client.name.toLowerCase().includes(term)) ||
          (client.email && client.email.toLowerCase().includes(term)) ||
          (client.id && client.id.toString().includes(term))
        )
      );

      this.lastOperationStatus = { 
        success: true,
        operation: 'searchClients',
        query: searchTerm,
        resultCount: results.length,
        timestamp: new Date().toISOString()
      };

      return results;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'searchClients', error: error.message };
      throw error;
    }
  }

  getActiveClients() {
    try {
      const results = this.data.filter(client =>
        !client.deleted && client.active !== false
      );

      this.lastOperationStatus = { 
        success: true,
        operation: 'getActiveClients',
        resultCount: results.length,
        timestamp: new Date().toISOString()
      };

      return results;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'getActiveClients', error: error.message };
      throw error;
    }
  }

  getClientsByDateRange(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('ValidationError: Fechas inválidas');
      }

      if (start > end) {
        throw new Error('ValidationError: Fecha de inicio debe ser anterior a fecha de fin');
      }

      const results = this.data.filter(client => {
        if (client.deleted) return false;

        const clientDate = new Date(client.createdAt || client.registrationDate);
        return clientDate >= start && clientDate <= end;
      });

      this.lastOperationStatus = { 
        success: true,
        operation: 'getClientsByDateRange',
        dateRange: { startDate, endDate },
        resultCount: results.length,
        timestamp: new Date().toISOString()
      };

      return results;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'getClientsByDateRange', error: error.message };
      throw error;
    }
  }

  getClientStats() {
    try {
      const allClients = this.data.filter(client => !client.deleted);
      const activeClients = allClients.filter(client => client.active !== false);
      const inactiveClients = allClients.filter(client => client.active === false);

      const stats = {
        total: allClients.length,
        active: activeClients.length,
        inactive: inactiveClients.length,
        timestamp: new Date().toISOString()
      };

      this.lastOperationStatus = { 
        success: true,
        operation: 'getClientStats',
        stats,
        timestamp: new Date().toISOString()
      };

      return stats;
    } catch (error) {
      this.lastOperationStatus = { success: false, operation: 'getClientStats', error: error.message };
      throw error;
    }
  }

  

  validateForCreate(client) {
    if (!client.name || typeof client.name !== 'string' || client.name.trim().length < 2) {
      throw new Error('ValidationError: Nombre es requerido y debe tener al menos 2 caracteres');
    }

    if (client.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(client.email)) {
        throw new Error('ValidationError: Formato de email inválido');
      }

      
      const existingClient = this.getByEmail(client.email);
      if (existingClient) {
        throw new Error('ValidationError: Ya existe un cliente con ese email');
      }
    }

    return true;
  }

  validateForUpdate(client) {
    return this.validateForCreate(client);
  }
}

const clientsServiceInstance = new ClientsService();

module.exports = clientsServiceInstance;
module.exports.ClientsService = clientsServiceInstance;
module.exports.ClientsServiceClass = ClientsService;
