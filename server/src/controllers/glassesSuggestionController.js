const GlassesSuggestion = require('../models/GlassesSuggestion');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');

const STATUSES = ['suggested', 'in-progress', 'completed', 'cancelled', 'delayed'];

const createSuggestion = asyncHandler(async (req, res) => {
  const { patientId, tokenId, rightEye, leftEye, lensType, frameNote } = req.body;

  if (!patientId) {
    return res.status(400).json({ message: 'patientId is required' });
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const suggestion = await GlassesSuggestion.create({
    patient: patient._id,
    token: tokenId || undefined,
    suggestedBy: req.user.id,
    rightEye: {
      sph: rightEye?.sph,
      cyl: rightEye?.cyl,
      axis: rightEye?.axis,
    },
    leftEye: {
      sph: leftEye?.sph,
      cyl: leftEye?.cyl,
      axis: leftEye?.axis,
    },
    lensType,
    frameNote,
  });

  const populated = await suggestion.populate('patient');
  res.status(201).json(populated);
});

const getPatientSuggestions = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const suggestions = await GlassesSuggestion.find({ patient: patient._id })
    .sort({ createdAt: -1 })
    .populate('patient')
    .populate('suggestedBy', 'fullName');
  res.json(suggestions);
});

const updateSuggestion = asyncHandler(async (req, res) => {
  const existing = await GlassesSuggestion.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Glasses suggestion not found' });
  }

  if (existing.status !== 'suggested') {
    return res.status(400).json({
      message: 'This suggestion is already being handled by optical and can no longer be edited',
    });
  }

  const { rightEye, leftEye, lensType, frameNote } = req.body;

  const fields = {
    rightEye: { sph: rightEye?.sph, cyl: rightEye?.cyl, axis: rightEye?.axis },
    leftEye: { sph: leftEye?.sph, cyl: leftEye?.cyl, axis: leftEye?.axis },
    lensType,
    frameNote,
  };

  // $set via findByIdAndUpdate (not Object.assign + .save()) so the write is
  // guaranteed to persist -- Mongoose's document-level dirty tracking has proven
  // unreliable for this pattern elsewhere in this codebase.
  const suggestion = await GlassesSuggestion.findByIdAndUpdate(
    req.params.id,
    { $set: fields },
    { new: true, runValidators: true }
  )
    .populate('patient')
    .populate('suggestedBy', 'fullName');

  res.json(suggestion);
});

const deleteSuggestion = asyncHandler(async (req, res) => {
  const existing = await GlassesSuggestion.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Glasses suggestion not found' });
  }

  if (existing.status !== 'suggested') {
    return res.status(400).json({
      message: 'This suggestion is already being handled by optical and can no longer be deleted',
    });
  }

  await existing.deleteOne();
  res.json({ message: 'Glasses suggestion deleted' });
});

const getAllSuggestions = asyncHandler(async (req, res) => {
  const { status, query } = req.query;

  const filter = {};
  if (status && STATUSES.includes(status)) {
    filter.status = status;
  }

  if (query && query.trim()) {
    const q = query.trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const patients = await Patient.find({
      $or: [{ fullName: regex }, { phone: regex }, { mrNumber: q.toUpperCase() }],
    }).select('_id');
    filter.patient = { $in: patients.map((p) => p._id) };
  }

  const suggestions = await GlassesSuggestion.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('patient')
    .populate('suggestedBy', 'fullName');
  res.json(suggestions);
});

const updateSuggestionStatus = asyncHandler(async (req, res) => {
  const { status, cost } = req.body;

  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  if (status === 'completed' && (cost === undefined || cost === null || cost === '' || Number(cost) < 0)) {
    return res.status(400).json({ message: 'A valid cost is required to mark this suggestion as completed' });
  }

  const fields = {
    status,
    statusUpdatedBy: req.user.id,
    statusUpdatedAt: new Date(),
  };
  if (status === 'completed') {
    fields.cost = Number(cost);
  }

  // $set via findByIdAndUpdate (not Object.assign + .save()) so the write is
  // guaranteed to persist -- Mongoose's document-level dirty tracking has proven
  // unreliable for this pattern elsewhere in this codebase.
  const suggestion = await GlassesSuggestion.findByIdAndUpdate(
    req.params.id,
    { $set: fields },
    { new: true, runValidators: true }
  )
    .populate('patient')
    .populate('suggestedBy', 'fullName');

  if (!suggestion) {
    return res.status(404).json({ message: 'Glasses suggestion not found' });
  }

  res.json(suggestion);
});

const getOpticalStats = asyncHandler(async (req, res) => {
  const [statusCountsRaw, revenueRaw] = await Promise.all([
    GlassesSuggestion.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    GlassesSuggestion.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$cost' }, count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = { suggested: 0, 'in-progress': 0, completed: 0, cancelled: 0, delayed: 0 };
  statusCountsRaw.forEach((d) => {
    statusCounts[d._id] = d.count;
  });

  const totalRevenue = revenueRaw[0]?.totalRevenue || 0;
  const completedCount = revenueRaw[0]?.count || 0;

  res.json({ statusCounts, totalRevenue, completedCount });
});

module.exports = {
  createSuggestion,
  getPatientSuggestions,
  getAllSuggestions,
  updateSuggestion,
  deleteSuggestion,
  updateSuggestionStatus,
  getOpticalStats,
};
