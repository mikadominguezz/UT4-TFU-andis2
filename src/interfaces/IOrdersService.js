const IService = require('./IService');
class IOrdersService extends IService {
  constructor() { super(); }
  getByClientId(clientId) { return this.data.filter(order => order.clientId == clientId); }
  getByDateRange(startDate, endDate) { const start = new Date(startDate); const end = new Date(endDate); return this.data.filter(order => { const orderDate = new Date(order.date || order.createdAt); return orderDate >= start && orderDate <= end; }); }
  calculateTotal(productIds) { if (!productIds || !Array.isArray(productIds)) return 0; const basePrice = 100; return productIds.length * basePrice; }
}
module.exports = IOrdersService;
