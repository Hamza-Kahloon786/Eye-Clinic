const mongoose = require('mongoose');

// One set of refraction values -- used for both Distance Vision (DV) and Near
// Vision (NV), since a patient can need a different correction for each.
const visionReadingSchema = new mongoose.Schema(
  {
    sph: { type: String, trim: true },
    cyl: { type: String, trim: true },
    axis: { type: String, trim: true },
    va: { type: String, trim: true }, // Visual Acuity, e.g. "6/6"
  },
  { _id: false }
);

const eyeRefractionSchema = new mongoose.Schema(
  {
    dv: { type: visionReadingSchema, default: () => ({}) },
    nv: { type: visionReadingSchema, default: () => ({}) },
  },
  { _id: false }
);

const glassesSuggestionSchema = new mongoose.Schema(
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
    suggestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rightEye: { type: eyeRefractionSchema, default: () => ({}) },
    leftEye: { type: eyeRefractionSchema, default: () => ({}) },
    lensType: { type: String, trim: true },
    frameNote: { type: String, trim: true },
    status: {
      type: String,
      enum: ['suggested', 'in-progress', 'completed', 'cancelled', 'delayed'],
      default: 'suggested',
    },
    cost: { type: Number, min: 0 },
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

glassesSuggestionSchema.index({ patient: 1, createdAt: -1 });
glassesSuggestionSchema.index({ status: 1 });

module.exports = mongoose.model('GlassesSuggestion', glassesSuggestionSchema);
