const OrdersRepository = require('../repository/ordersRepository');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = '/app/proto/order.proto';
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

  async saveOrder(orderData) {
    try {
      if (!orderData.clientId || !orderData.productIds) {
        throw new Error('ClientId and ProductIds are required');
      }
      return await OrdersRepository.saveOrder(orderData);
    } catch (error) {
      console.error('Service Error - saveOrder:', error);
      throw error;
    }
  }

  getById(id) {
    return this.getOrderById(id).catch(() => null);
  }

  // gRPC method to get order info
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
