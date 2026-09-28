const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    mrNumber: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    fullName: { type: String, required: true, trim: true },
    guardianName: { type: String, trim: true },
    age: { type: Number, required: true, min: 0 },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    registrationDate: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  { timestamps: true }
);

patientSchema.index({ phone: 1 });
patientSchema.index({ fullName: 1 });

module.exports = mongoose.model('Patient', patientSchema);
