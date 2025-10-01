const OrdersRepository = require('../repository/ordersRepository');
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
const orderProto = grpc.loadPackageDefinition(packageDefinition).OrderService;

const client = new orderProto('localhost:50053', grpc.credentials.createInsecure());

class OrdersService {
  
  async getOrders() {
    try {
      return await OrdersRepository.getOrders();
    } catch (error) {
      console.error('Service Error - getOrders:', error);
      throw new Error('Unable to fetch orders');
    }
  }

  async getOrderById(id) {
    try {
      const order = await OrdersRepository.getOrderById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      console.error('Service Error - getOrderById:', error);
      throw error;
    }
  }

  async getOrdersByClientId(clientId) {
    try {
      return await OrdersRepository.getOrdersByClientId(clientId);
    } catch (error) {
      console.error('Service Error - getOrdersByClientId:', error);
      throw new Error('Unable to fetch client orders');
    }
  }

  async saveOrder(orderData) {
    try {
      if (!orderData.clientId || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Client ID and items are required');
      }

      return await OrdersRepository.saveOrder(orderData);
    } catch (error) {
      console.error('Service Error - saveOrder:', error);
      throw error;
    }
  }

  // Simple sync-style methods to match original controller
  getByDateRange(startDate, endDate) {
    try {
      // Basic mock implementation - in original it was synchronous
      return [];
    } catch (error) {
      throw new Error('Formato de fecha inválido');
    }
  }

  calculateTotal(productIds) {
    try {
      // Basic mock implementation - in original it was synchronous
      const mockPrices = { 1: 10, 2: 20, 3: 30 }; // Mock product prices
      return productIds.reduce((sum, id) => sum + (mockPrices[id] || 0), 0);
    } catch (error) {
      throw new Error('Error calculating total');
    }
  }

  getTotalRevenue() {
    // Basic mock implementation - in original it was synchronous
    return 1500.50;
  }

  getOrdersToday() {
    // Basic mock implementation - in original it was synchronous
    return [];
  }

  getClientOrderCount(clientId) {
    // Basic mock implementation - in original it was synchronous
    return 0;
  }

  getOrderInfo(orderId) {
    return new Promise((resolve, reject) => {
      client.GetOrderInfo({ order_id: orderId }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

module.exports = new OrdersService();