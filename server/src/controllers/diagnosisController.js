const Diagnosis = require('../models/Diagnosis');
const asyncHandler = require('../utils/asyncHandler');

const getDiagnoses = asyncHandler(async (req, res) => {
  const diagnoses = await Diagnosis.find().sort({ name: 1 });
  res.json(diagnoses);
});

const createDiagnosis = asyncHandler(async (req, res) => {
  const { name, defaultPrescription } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'name is required' });
  }

  const trimmed = name.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existing = await Diagnosis.findOne({ name: new RegExp(`^${escaped}$`, 'i') });
  if (existing) {
    return res.status(200).json(existing);
  }

  const diagnosis = await Diagnosis.create({ name: trimmed, defaultPrescription });
  res.status(201).json(diagnosis);
});

const updateDiagnosis = asyncHandler(async (req, res) => {
  const { name, defaultPrescription } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'name is required' });
  }

  const trimmed = name.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const duplicate = await Diagnosis.findOne({
    _id: { $ne: req.params.id },
    name: new RegExp(`^${escaped}$`, 'i'),
  });
  if (duplicate) {
    return res.status(409).json({ message: 'A diagnosis with this name already exists' });
  }

  const diagnosis = await Diagnosis.findByIdAndUpdate(
    req.params.id,
    { name: trimmed, defaultPrescription },
    { new: true, runValidators: true }
  );
  if (!diagnosis) {
    return res.status(404).json({ message: 'Diagnosis not found' });
  }

  res.json(diagnosis);
});

const deleteDiagnosis = asyncHandler(async (req, res) => {
  const diagnosis = await Diagnosis.findByIdAndDelete(req.params.id);
  if (!diagnosis) {
    return res.status(404).json({ message: 'Diagnosis not found' });
  }

  res.json({ message: 'Diagnosis deleted' });
});

module.exports = { getDiagnoses, createDiagnosis, updateDiagnosis, deleteDiagnosis };
