const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    scheduledDate: { type: String, required: true }, // 'YYYY-MM-DD'
    scheduledTime: { type: String, required: true }, // 'HH:mm'
    status: {
      type: String,
      enum: ['scheduled', 'checked-in', 'cancelled'],
      default: 'scheduled',
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
    },
    notes: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ scheduledDate: 1, scheduledTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
