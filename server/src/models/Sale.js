const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true, immutable: true },
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    medicineName: { type: String, required: true, trim: true },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Sale', saleSchema);
