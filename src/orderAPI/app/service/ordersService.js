class OrdersService {
  constructor(ordersRepository) {
    this.ordersRepository = ordersRepository;
  }

  async getOrders() {
    const orders = await this.ordersRepository.getOrders();
    return orders;
  }

  async getOrderById(id) {
    const order = await this.ordersRepository.getOrderById(id);
    return order;
  }

  async saveOrder(orderData) {
    const savedOrder = await this.ordersRepository.saveOrder(orderData);
    return savedOrder;
  }
}

module.exports = OrdersService;