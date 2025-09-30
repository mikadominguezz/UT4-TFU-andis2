const BaseService = require('../implementations/BaseService');
const IOrdersService = require('../interfaces/IOrdersService');

const ProductsService = require('./productsService');
const ClientsService = require('./clientsService');

const ordersData = [
  { id: 1, clientId: 1, productIds: [1, 2], date: '2024-09-01T10:30:00Z', total: 300 },
  { id: 2, clientId: 2, productIds: [1], date: '2024-09-15T14:45:00Z', total: 100 }
];

class OrdersService extends BaseService {
  constructor() {
    super();

    this.data = ordersData.map(order => ({
      ...order,
      deleted: false,
      createdAt: order.date || new Date().toISOString()
    }));
  }

  
  create(data) {

    const client = ClientsService.getById(data.clientId);
    if (!client) {
      throw new Error('ValidationError: Cliente no encontrado');
    }

    
    const products = data.productIds.map(id => ProductsService.getById(id));
    if (products.some(p => !p)) {
      throw new Error('ValidationError: Uno o más productos no existen');
    }

    
    const total = this.calculateTotal(data.productIds);

    
    const orderData = {
      ...data,
      total,
      status: 'pending',
      client: client.name,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price
      }))
    };

    return super.create(orderData);
  }

  getByClientId(clientId) { return this.data.filter(o => o.clientId == clientId); }

  getByDateRange(startDate, endDate) { return this.data.filter(o => { const orderDate = new Date(o.date); return orderDate >= new Date(startDate) && orderDate <= new Date(endDate); }); }

  calculateTotal(productIds) { 
    const products = productIds.map(id => ProductsService.getById(id));
    return products.reduce((sum, product) => sum + (product ? product.price : 0), 0);
  }

  

  count() {
    try {
      return this.data.filter(order => order && !order.deleted).length;
    } catch (error) {
      console.error('Error counting orders:', error.message);
      return 0;
    }
  }

  exists(id) {
    try {
      return this.data.some(order => order && order.id == id && !order.deleted);
    } catch (error) {
      console.error('Error checking order existence:', error.message);
      return false;
    }
  }

  

  clear() {
    try {
      const previousCount = this.count();
      this.data = [];

      const result = {
        message: 'Todas las órdenes han sido eliminadas',
        previousCount,
        clearedAt: new Date().toISOString(),
        operation: 'clear-orders'
      };

      console.log(`[ORDERS] Clear operation: ${previousCount} orders removed`);
      return result;
    } catch (error) {
      console.error('Error clearing orders:', error.message);
      throw error;
    }
  }

  

  getOrdersByStatus(status) {
    try {
      return this.data.filter(order =>
        order && !order.deleted && order.status === status
      );
    } catch (error) {
      console.error('Error filtering orders by status:', error.message);
      return [];
    }
  }

  getTotalRevenue() {
    try {
      return this.data
        .filter(order => order && !order.deleted)
        .reduce((total, order) => total + (order.total || 0), 0);
    } catch (error) {
      console.error('Error calculating total revenue:', error.message);
      return 0;
    }
  }

  getOrdersToday() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      return this.getByDateRange(startOfDay.toISOString(), endOfDay.toISOString());
    } catch (error) {
      console.error('Error getting today orders:', error.message);
      return [];
    }
  }

  getClientOrderCount(clientId) {
    try {
      return this.getByClientId(clientId).length;
    } catch (error) {
      console.error('Error counting client orders:', error.message);
      return 0;
    }
  }
}

const ordersServiceInstance = new OrdersService();

module.exports = ordersServiceInstance;
module.exports.OrdersService = ordersServiceInstance;
module.exports.OrdersServiceClass = OrdersService;
