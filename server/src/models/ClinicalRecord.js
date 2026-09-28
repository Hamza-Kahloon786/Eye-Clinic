const mongoose = require('mongoose');

const clinicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
    },
    visitNumber: { type: Number, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD', server-local date
    time: { type: String, required: true }, // 'HH:mm', server-local time
    weight: { type: Number, min: 0 },
    allergy: { type: String, trim: true },
    medicalHistory: {
      dm: { type: Boolean, default: false }, // Diabetes Mellitus
      htn: { type: Boolean, default: false }, // Hypertension
      ihd: { type: Boolean, default: false }, // Ischemic Heart Disease
      ckd: { type: Boolean, default: false }, // Chronic Kidney Disease
    },
    symptomHistoryCondition: { type: String, trim: true },
    finding: { type: String, trim: true },
    treatment: { type: String, trim: true },
    diagnosis: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

clinicalRecordSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('ClinicalRecord', clinicalRecordSchema);
