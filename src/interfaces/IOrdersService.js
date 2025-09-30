const IService = require('./IService');
class IOrdersService extends IService {
  constructor() { super(); }
  getByClientId(clientId) { return this.data.filter(order => order.clientId == clientId); }
  calculateTotal(productIds) { if (!productIds || !Array.isArray(productIds)) return 0; const basePrice = 100; return productIds.length * basePrice; }
}
module.exports = IOrdersService;
