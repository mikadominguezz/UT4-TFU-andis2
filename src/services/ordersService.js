const Order = require('../models/Order');
const IOrdersService = require('../interfaces/IOrdersService');

class OrdersService extends IOrdersService {
  constructor() {
    super();
  }

  async getAll() {
    try {
      const orders = await Order.find()
        .populate('clientId', 'name email')
        .populate('items.productId', 'name price')
        .sort({ createdAt: -1 })
        .lean();
      return orders.map(o => ({ ...o, id: o._id.toString() }));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async getById(id) {
    try {
      const order = await Order.findById(id)
        .populate('clientId', 'name email')
        .populate('items.productId', 'name price')
        .lean();
      
      if (order) {
        return { ...order, id: order._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error getting order by id:', error);
      return null;
    }
  }

  async create(data) {
    try {
      const orderData = {
        clientId: data.clientId,
        items: data.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        totals: {
          subtotal: data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          tax: data.tax || 0,
          shipping: data.shipping || 0
        },
        status: data.status || 'pending',
        shippingAddress: data.shippingAddress || {},
        notes: data.notes || ''
      };

      orderData.totals.total = orderData.totals.subtotal + orderData.totals.tax + orderData.totals.shipping;

      const order = new Order(orderData);
      const saved = await order.save();
      
      const populated = await Order.findById(saved._id)
        .populate('clientId', 'name email')
        .populate('items.productId', 'name price')
        .lean();
      
      return { ...populated, id: populated._id.toString() };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Error creating order');
    }
  }

  async update(id, data) {
    try {
      const updated = await Order.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .populate('clientId', 'name email')
      .populate('items.productId', 'name price')
      .lean();
      
      if (updated) {
        return { ...updated, id: updated._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Error updating order');
    }
  }

  async delete(id) {
    try {
      const result = await Order.findByIdAndUpdate(
        id,
        { status: 'cancelled', updatedAt: new Date() }
      );
      return !!result;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  async getByClientId(clientId) {
    try {
      const orders = await Order.find({ clientId })
        .populate('clientId', 'name email')
        .populate('items.productId', 'name price')
        .sort({ createdAt: -1 })
        .lean();
      return orders.map(o => ({ ...o, id: o._id.toString() }));
    } catch (error) {
      console.error('Error getting orders by client:', error);
      return [];
    }
  }

  async getByStatus(status) {
    try {
      const orders = await Order.find({ status })
        .populate('clientId', 'name email')
        .populate('items.productId', 'name price')
        .sort({ createdAt: -1 })
        .lean();
      return orders.map(o => ({ ...o, id: o._id.toString() }));
    } catch (error) {
      console.error('Error getting orders by status:', error);
      return [];
    }
  }

  async updateStatus(id, status) {
    try {
      const updated = await Order.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      )
      .populate('clientId', 'name email')
      .populate('items.productId', 'name price')
      .lean();
      
      if (updated) {
        return { ...updated, id: updated._id.toString() };
      }
      return null;
    } catch (error) {
      console.error('Error updating order status:', error);
      return null;
    }
  }

  async count() {
    try {
      return await Order.countDocuments({ status: { $ne: 'cancelled' } });
    } catch (error) {
      console.error('Error counting orders:', error);
      return 0;
    }
  }

  async exists(id) {
    try {
      const order = await Order.findById(id);
      return !!order;
    } catch (error) {
      console.error('Error checking order existence:', error);
      return false;
    }
  }

  validateForCreate(order) {
    if (!order.clientId) {
      throw new Error('ValidationError: ClientId es requerido');
    }

    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('ValidationError: Items son requeridos');
    }

    for (const item of order.items) {
      if (!item.productId) {
        throw new Error('ValidationError: ProductId es requerido para cada item');
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error('ValidationError: Quantity debe ser mayor a 0');
      }
      if (!item.price || item.price <= 0) {
        throw new Error('ValidationError: Price debe ser mayor a 0');
      }
    }

    return true;
  }

  validateForUpdate(order) {
    return this.validateForCreate(order);
  }
}

const ordersServiceInstance = new OrdersService();

module.exports = ordersServiceInstance;
module.exports.OrdersService = ordersServiceInstance;
module.exports.OrdersServiceClass = OrdersService;
