const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'México' }
  },
  preferences: {
    categories: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastLogin: Date,
    registrationSource: String
  }
}, {
  timestamps: true,
  collection: 'clients'
});

clientSchema.index({ email: 1 });
clientSchema.index({ username: 1 });
clientSchema.index({ isActive: 1 });

module.exports = mongoose.model('Client', clientSchema);