const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PricingPlan',
    },

    amount: Number,

    currency: {
      type: String,
      default: 'USD',
    },

    billingType: {
      type: String,
      enum: ['monthly', 'annually'],
    },

    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'paypal', 'stripe'],
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },

    transactionId: String,

    paidAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Payment', paymentSchema);
