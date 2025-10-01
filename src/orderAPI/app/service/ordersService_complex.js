const OrdersRepository = require('../repository/ordersRepository');

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
      // Validate required fields
      if (!orderData.clientId || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Client ID and items are required');
      }

      // Calculate total if not provided
      if (!orderData.total && orderData.items) {
        orderData.total = orderData.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
      }

      return await OrdersRepository.saveOrder(orderData);
    } catch (error) {
      console.error('Service Error - saveOrder:', error);
      throw error;
    }
  }

  async updateOrderStatus(id, status) {
    try {
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }

      return await OrdersRepository.updateOrderStatus(id, status);
    } catch (error) {
      console.error('Service Error - updateOrderStatus:', error);
      throw error;
    }
  }

  async cancelOrder(id) {
    try {
      return await OrdersRepository.cancelOrder(id);
    } catch (error) {
      console.error('Service Error - cancelOrder:', error);
      throw error;
    }
  }

  async getOrderStats() {
    try {
      return await OrdersRepository.getOrderStats();
    } catch (error) {
      console.error('Service Error - getOrderStats:', error);
      throw new Error('Unable to fetch order statistics');
    }
  }

  // Legacy methods for backward compatibility
  getAll() {
    return this.getOrders().catch(() => []);
  }

  create(orderData) {
    return this.saveOrder(orderData);
  }
}

module.exports = new OrdersService();