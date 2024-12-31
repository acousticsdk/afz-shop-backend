import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  steamLogin: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  finalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    enum: ['RUB', 'KZT', 'USD']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Order = mongoose.model('Order', orderSchema);