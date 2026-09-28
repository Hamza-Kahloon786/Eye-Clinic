const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    defaultPrescription: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
