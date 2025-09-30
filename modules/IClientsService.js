// Interface específica para clientes
// Proporciona implementaciones por defecto para métodos específicos de clientes
// Las clases derivadas pueden sobrescribir estos métodos según sus necesidades

const IService = require('./IService');

class IClientsService extends IService {
  constructor() {
    super();
  }

  getByName(name) {
    // Implementación por defecto: busca clientes por nombre (case-insensitive)
    if (!name || typeof name !== 'string') {
      return [];
    }
    
    return this.data.filter(client => 
      client.name && client.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Métodos auxiliares adicionales para clientes
  getByEmail(email) {
    if (!email || typeof email !== 'string') {
      return null;
    }
    
    return this.data.find(client => 
      client.email && client.email.toLowerCase() === email.toLowerCase()
    );
  }

  getActiveClients() {
    return this.data.filter(client => client.active !== false);
  }

  getClientsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.data.filter(client => {
      const clientDate = new Date(client.createdAt || client.registrationDate);
      return clientDate >= start && clientDate <= end;
    });
  }

  searchClients(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return [];
    }
    
    const term = searchTerm.toLowerCase();
    return this.data.filter(client => 
      (client.name && client.name.toLowerCase().includes(term)) ||
      (client.email && client.email.toLowerCase().includes(term)) ||
      (client.id && client.id.toString().includes(term))
    );
  }

  getClientStats() {
    return {
      total: this.data.length,
      active: this.getActiveClients().length,
      inactive: this.data.filter(client => client.active === false).length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = IClientsService;