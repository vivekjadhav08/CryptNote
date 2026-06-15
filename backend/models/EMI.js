const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paidDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: '' }
});

const EMISchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  name: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  emiAmount: { type: Number, required: true },
  durationMonths: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  interestRate: { type: Number, default: 0 },
  lender: { type: String, default: '' },
  category: { type: String, default: 'Other' },
  payments: [PaymentSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('emi', EMISchema);
