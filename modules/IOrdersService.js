// Interface específica para órdenes
// Proporciona implementaciones por defecto para métodos específicos de órdenes
// Las clases derivadas pueden sobrescribir estos métodos según sus necesidades

const IService = require('./IService');

class IOrdersService extends IService {
  constructor() {
    super();
  }

  getByClientId(clientId) {
    // Implementación por defecto: busca órdenes por ID de cliente
    return this.data.filter(order => order.clientId == clientId);
  }

  getByDateRange(startDate, endDate) {
    // Implementación por defecto: busca órdenes por rango de fechas
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.data.filter(order => {
      const orderDate = new Date(order.date || order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }

  calculateTotal(productIds) {
    // Implementación por defecto: calcula total básico
    // Asume un precio fijo de 100 por producto si no hay servicio de productos
    if (!productIds || !Array.isArray(productIds)) {
      return 0;
    }
    
    // Precio base por producto (las clases derivadas pueden sobrescribir esto)
    const basePrice = 100;
    return productIds.length * basePrice;
  }

  // Métodos auxiliares adicionales para órdenes
  getOrdersByStatus(status) {
    return this.data.filter(order => order.status === status);
  }

  getTotalRevenue() {
    return this.data.reduce((total, order) => total + (order.total || 0), 0);
  }

  getOrdersToday() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return this.getByDateRange(startOfDay.toISOString(), endOfDay.toISOString());
  }

  getClientOrderCount(clientId) {
    return this.getByClientId(clientId).length;
  }
}

module.exports = IOrdersService;