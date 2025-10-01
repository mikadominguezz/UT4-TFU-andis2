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

  // Basic client management methods
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

  // Product management methods
  async createProduct(productData) {
    try {
      // For simplicity, we'll create products directly in the admin service
      // Import Product schema directly (they share the same database)
      const Product = require('../../productAPI/app/schema/ProductSchema');
      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      console.error('Service Error - createProduct:', error);
      throw error;
    }
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