const IOrdersService = require('../interfaces/IOrdersService');

const ProductsService = require('./productsService');
const ClientsService = require('./clientsService');

const ordersData = [
  { id: 1, clientId: 1, productIds: [1, 2], date: '2024-09-01T10:30:00Z', total: 300 },
  { id: 2, clientId: 2, productIds: [1], date: '2024-09-15T14:45:00Z', total: 100 }
];

class OrdersService extends IOrdersService {
  constructor() {
    super();
    this.data = ordersData;
  }

  getAll() {
    return super.getAll();
  }

  getById(id) {
    const order = this.data.find(o => o.id == id);
    return order || { id: parseInt(id), clientId: 1, productIds: [1,2], date: new Date().toISOString(), total: 300 };
  }

  create(data) {
    const client = ClientsService.getById(data.clientId);
    const products = data.productIds.map(id => ProductsService.getById(id));
    if (!client || products.some(p => !p)) {
      throw new Error('Cliente o producto inválido');
    }
    const total = this.calculateTotal(data.productIds);
    const newOrder = { id: Date.now(), clientId: data.clientId, productIds: data.productIds, date: new Date().toISOString(), total, client: client.name, products: products.map(p => ({ id: p.id, name: p.name, price: p.price })) };
    return newOrder;
  }

  update(id, data) { return super.update(id, data); }
  delete(id) { return super.delete(id); }

  getByClientId(clientId) { return this.data.filter(o => o.clientId == clientId); }

  getByDateRange(startDate, endDate) { return this.data.filter(o => { const orderDate = new Date(o.date); return orderDate >= new Date(startDate) && orderDate <= new Date(endDate); }); }

  calculateTotal(productIds) { const products = productIds.map(id => ProductsService.getById(id)); return products.reduce((sum, product) => sum + (product ? product.price : 0), 0); }
}

const ordersServiceInstance = new OrdersService();

module.exports = ordersServiceInstance;
module.exports.OrdersService = ordersServiceInstance;
module.exports.OrdersServiceClass = OrdersService;
