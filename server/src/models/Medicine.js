const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    productCode: { type: String, trim: true },
    name: { type: String, required: true, unique: true, trim: true },
    genericName: { type: String, trim: true },
    packing: { type: String, trim: true },
    retailPrice: { type: Number, min: 0 },
    tradePrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
