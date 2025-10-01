const ClientsRepository = require('../repository/clientsRepository');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = '/app/proto/client.proto';
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

  async saveClient(clientData) {
    try {
      if (!clientData.name) {
        throw new Error('Name is required');
      }
      return await ClientsRepository.saveClient(clientData);
    } catch (error) {
      console.error('Service Error - saveClient:', error);
      throw error;
    }
  }

  getById(id) {
    return this.getClientById(id).catch(() => null);
  }

  // gRPC method to get client info
  getClientInfo(clientId) {
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
}

module.exports = new ClientsService();
