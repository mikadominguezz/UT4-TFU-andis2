const Order = require('../schema/OrderSchema');

class OrdersRepository {
    
    async getOrders() {
        try {
            return await Order.find({ status: { $ne: 'cancelled' } })
                .populate('clientId', 'name email')
                .sort({ createdAt: -1 });
        } catch (error) {
            console.error('Repository Error - getOrders:', error);
            throw error;
        }
    }

    async getOrderById(id) {
        try {
            return await Order.findOne({ _id: id, status: { $ne: 'cancelled' } })
                .populate('clientId', 'name email');
        } catch (error) {
            console.error('Repository Error - getOrderById:', error);
            throw error;
        }
    }

    async getOrdersByClientId(clientId) {
        try {
            return await Order.find({ 
                clientId: clientId, 
                status: { $ne: 'cancelled' } 
            }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Repository Error - getOrdersByClientId:', error);
            throw error;
        }
    }

    async getOrdersByStatus(status) {
        try {
            return await Order.find({ status: status })
                .populate('clientId', 'name email')
                .sort({ createdAt: -1 });
        } catch (error) {
            console.error('Repository Error - getOrdersByStatus:', error);
            throw error;
        }
    }

    async saveOrder(orderData) {
        try {
            const order = new Order({
                ...orderData,
                status: orderData.status || 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return await order.save();
        } catch (error) {
            console.error('Repository Error - saveOrder:', error);
            throw error;
        }
    }

    async updateOrder(id, updateData) {
        try {
            return await Order.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: new Date() },
                { new: true }
            ).populate('clientId', 'name email');
        } catch (error) {
            console.error('Repository Error - updateOrder:', error);
            throw error;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            return await Order.findByIdAndUpdate(
                id,
                { status: status, updatedAt: new Date() },
                { new: true }
            ).populate('clientId', 'name email');
        } catch (error) {
            console.error('Repository Error - updateOrderStatus:', error);
            throw error;
        }
    }

    async cancelOrder(id) {
        try {
            return await Order.findByIdAndUpdate(
                id,
                { status: 'cancelled', updatedAt: new Date() },
                { new: true }
            );
        } catch (error) {
            console.error('Repository Error - cancelOrder:', error);
            throw error;
        }
    }

    async getOrderStats() {
        try {
            const totalOrders = await Order.countDocuments({ status: { $ne: 'cancelled' } });
            const pendingOrders = await Order.countDocuments({ status: 'pending' });
            const completedOrders = await Order.countDocuments({ status: 'completed' });
            const processingOrders = await Order.countDocuments({ status: 'processing' });
            
            return {
                total: totalOrders,
                pending: pendingOrders,
                processing: processingOrders,
                completed: completedOrders,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Repository Error - getOrderStats:', error);
            throw error;
        }
    }

    async getOrdersInDateRange(startDate, endDate) {
        try {
            return await Order.find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                },
                status: { $ne: 'cancelled' }
            }).populate('clientId', 'name email')
              .sort({ createdAt: -1 });
        } catch (error) {
            console.error('Repository Error - getOrdersInDateRange:', error);
            throw error;
        }
    }
}

module.exports = new OrdersRepository();