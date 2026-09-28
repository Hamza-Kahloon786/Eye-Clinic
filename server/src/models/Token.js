const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    tokenNumber: { type: Number, required: true },
    serialNumber: { type: Number, required: true, unique: true }, // all-time running count, never resets
    fee: { type: Number, default: 0, min: 0 },
    date: { type: String, required: true }, // 'YYYY-MM-DD', server-local date
    generatedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['waiting', 'in-progress', 'done'],
      default: 'waiting',
    },
    statusUpdatedAt: { type: Date, default: Date.now },
    diagnosis: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Doubles as the "today's queue sorted by tokenNumber" query index,
// and as a hard safety net against duplicate token numbers per day.
tokenSchema.index({ date: 1, tokenNumber: 1 }, { unique: true });

module.exports = mongoose.model('Token', tokenSchema);
