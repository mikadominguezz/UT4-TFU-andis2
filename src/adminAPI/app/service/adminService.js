const AdminRepository = require('../repository/adminRepository');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = '/app/proto/admin.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const adminProto = grpc.loadPackageDefinition(packageDefinition).AdminService;

const client = new adminProto('localhost:50052', grpc.credentials.createInsecure());

class AdminService {
  
  // Basic client management - keep it simple like original
  async getAllClientsWithDetails() {
    try {
      return await AdminRepository.getAllClients();
    } catch (error) {
      console.error('Service Error - getAllClientsWithDetails:', error);
      throw new Error('Unable to fetch clients');
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
      if (!clientData.name) {
        throw new Error('Name is required');
      }
      return await AdminRepository.createClientAsAdmin(clientData);
    } catch (error) {
      console.error('Service Error - createClientAsAdmin:', error);
      throw error;
    }
  }

  async updateClientAsAdmin(id, updateData) {
    try {
      return await AdminRepository.updateClient(id, updateData);
    } catch (error) {
      console.error('Service Error - updateClientAsAdmin:', error);
      throw error;
    }
  }

  async searchClients(searchTerm) {
    try {
      return await AdminRepository.searchClients(searchTerm);
    } catch (error) {
      console.error('Service Error - searchClients:', error);
      throw error;
    }
  }

  async toggleClientStatus(id, active) {
    try {
      return await AdminRepository.updateClient(id, { isActive: active });
    } catch (error) {
      console.error('Service Error - toggleClientStatus:', error);
      throw error;
    }
  }

  // Legacy sync-style methods for backward compatibility
  getById(id) {
    return this.getClientById(id).catch(() => null);
  }

  // Simple admin stats - optional method
  getAdminStats() {
    // Simple mock stats for dashboard
    return {
      totalClients: 0,
      activeClients: 0,
      lastUpdate: new Date().toISOString()
    };
  }

  // Additional methods that were in original controller
  advancedClientSearch(criteria) {
    // Mock implementation
    return [];
  }

  generateClientReport() {
    // Mock implementation
    return { message: 'Report generated', timestamp: new Date() };
  }

  bulkUpdateClients(clientIds, updateData) {
    // Mock implementation
    return { updated: clientIds.length, data: updateData };
  }

  // gRPC method to get admin info
  getAdminInfo(adminId) {
    return new Promise((resolve, reject) => {
      client.GetAdminInfo({ admin_id: adminId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

module.exports = new AdminService();