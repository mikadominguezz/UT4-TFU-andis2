const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: Number
  }],
  totals: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentInfo: {
    method: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  notes: String,
  metadata: {
    source: String,
    promotionCode: String,
    customerNotes: String
  }
}, {
  timestamps: true,
  collection: 'orders'
});

orderSchema.index({ clientId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentInfo.status': 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totals.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.totals.total = this.totals.subtotal + this.totals.tax + this.totals.shipping;
    
    this.items.forEach(item => {
      item.subtotal = item.price * item.quantity;
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);