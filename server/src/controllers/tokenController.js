const Token = require('../models/Token');
const asyncHandler = require('../utils/asyncHandler');
const getTodayDateString = require('../utils/getTodayDateString');
const { issueToken } = require('../services/tokenService');

const createToken = asyncHandler(async (req, res) => {
  const { patientId, fee } = req.body;
  if (!patientId) {
    return res.status(400).json({ message: 'patientId is required' });
  }

  const token = await issueToken({ patientId, fee, createdBy: req.user.id });
  if (!token) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  res.status(201).json(token);
});

const getTodayQueue = asyncHandler(async (req, res) => {
  const date = getTodayDateString();
  const tokens = await Token.find({ date }).sort({ tokenNumber: 1 }).populate('patient');
  res.json(tokens);
});

const getTokenById = asyncHandler(async (req, res) => {
  const token = await Token.findById(req.params.id).populate('patient');
  if (!token) {
    return res.status(404).json({ message: 'Token not found' });
  }
  res.json(token);
});

const updateTokenStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['waiting', 'in-progress', 'done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const token = await Token.findByIdAndUpdate(
    req.params.id,
    { status, statusUpdatedAt: new Date() },
    { new: true }
  ).populate('patient');

  if (!token) {
    return res.status(404).json({ message: 'Token not found' });
  }

  res.json(token);
});

const updateTokenDiagnosis = asyncHandler(async (req, res) => {
  const { diagnosis } = req.body;

  const token = await Token.findByIdAndUpdate(req.params.id, { diagnosis }, { new: true }).populate('patient');

  if (!token) {
    return res.status(404).json({ message: 'Token not found' });
  }

  res.json(token);
});

module.exports = { createToken, getTodayQueue, getTokenById, updateTokenStatus, updateTokenDiagnosis };
