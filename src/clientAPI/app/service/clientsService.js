const ClientsRepository = require('../repository/clientsRepository');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = '/app/proto/product.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const clientProto = grpc.loadPackageDefinition(packageDefinition).ClientService;

const client = new clientProto('localhost:50051', grpc.credentials.createInsecure());

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

  async getClientInfo(clientId) {
    return new Promise((resolve, reject) => {
      client.GetClientInfo({ client_id: clientId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
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