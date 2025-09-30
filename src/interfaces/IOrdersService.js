const IService = require('./IService');
class IOrdersService extends IService {
  constructor() { super(); }
  getByClientId(clientId) { return this.data.filter(order => order.clientId == clientId); }
  getByDateRange(startDate, endDate) { const start = new Date(startDate); const end = new Date(endDate); return this.data.filter(order => { const orderDate = new Date(order.date || order.createdAt); return orderDate >= start && orderDate <= end; }); }
  calculateTotal(productIds) { if (!productIds || !Array.isArray(productIds)) return 0; const basePrice = 100; return productIds.length * basePrice; }
  getOrdersByStatus(status) { return this.data.filter(order => order.status === status); }
  getTotalRevenue() { return this.data.reduce((total, order) => total + (order.total || 0), 0); }
  getOrdersToday() { const today = new Date(); const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()); const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); return this.getByDateRange(startOfDay.toISOString(), endOfDay.toISOString()); }
  getClientOrderCount(clientId) { return this.getByClientId(clientId).length; }
}
module.exports = IOrdersService;
