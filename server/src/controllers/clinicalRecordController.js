const ClinicalRecord = require('../models/ClinicalRecord');
const Patient = require('../models/Patient');
const Token = require('../models/Token');
const asyncHandler = require('../utils/asyncHandler');
const getTodayDateString = require('../utils/getTodayDateString');

function getNowTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const createRecord = asyncHandler(async (req, res) => {
  const {
    patientId,
    tokenId,
    weight,
    allergy,
    medicalHistory,
    symptomHistoryCondition,
    finding,
    treatment,
    diagnosis,
  } = req.body;

  if (!patientId) {
    return res.status(400).json({ message: 'patientId is required' });
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  if (tokenId) {
    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }
  }

  const existing = tokenId ? await ClinicalRecord.findOne({ token: tokenId }) : null;

  const fields = {
    weight: weight || undefined,
    allergy,
    medicalHistory: {
      dm: !!medicalHistory?.dm,
      htn: !!medicalHistory?.htn,
      ihd: !!medicalHistory?.ihd,
      ckd: !!medicalHistory?.ckd,
    },
    symptomHistoryCondition,
    finding,
    treatment,
    diagnosis,
  };

  let record;
  if (existing) {
    // $set (not Object.assign + .save()) so nested-object fields like medicalHistory
    // are reliably marked dirty and persisted -- Mongoose's document-level dirty
    // tracking can silently miss plain-object overwrites on nested paths.
    record = await ClinicalRecord.findByIdAndUpdate(existing._id, { $set: fields }, { new: true, runValidators: true });
  } else {
    const visitNumber = await Token.countDocuments({ patient: patient._id });
    record = await ClinicalRecord.create({
      patient: patient._id,
      token: tokenId || undefined,
      visitNumber,
      date: getTodayDateString(),
      time: getNowTimeString(),
      ...fields,
      createdBy: req.user.id,
    });
  }

  const populated = await record.populate('patient');
  res.status(existing ? 200 : 201).json(populated);
});

const getPatientRecords = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const records = await ClinicalRecord.find({ patient: patient._id })
    .sort({ date: -1, time: -1 })
    .populate('patient');
  res.json(records);
});

const getAllRecords = asyncHandler(async (req, res) => {
  const { query, date } = req.query;

  const filter = {};
  if (date) {
    filter.date = date;
  }

  if (query && query.trim()) {
    const q = query.trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const patients = await Patient.find({
      $or: [{ fullName: regex }, { phone: regex }, { mrNumber: q.toUpperCase() }],
    }).select('_id');
    filter.patient = { $in: patients.map((p) => p._id) };
  }

  const records = await ClinicalRecord.find(filter)
    .sort({ date: -1, time: -1 })
    .limit(200)
    .populate('patient');
  res.json(records);
});

const getPatientsWithRecords = asyncHandler(async (req, res) => {
  const { query, date } = req.query;

  const filter = {};
  if (date) {
    filter.date = date;
  }

  if (query && query.trim()) {
    const q = query.trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const patients = await Patient.find({
      $or: [{ fullName: regex }, { phone: regex }, { mrNumber: q.toUpperCase() }],
    }).select('_id');
    filter.patient = { $in: patients.map((p) => p._id) };
  }

  const groups = await ClinicalRecord.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$patient',
        recordCount: { $sum: 1 },
        lastVisitDate: { $max: '$date' },
      },
    },
    { $sort: { lastVisitDate: -1 } },
    { $limit: 200 },
    {
      $lookup: {
        from: 'patients',
        localField: '_id',
        foreignField: '_id',
        as: 'patient',
      },
    },
    { $unwind: '$patient' },
    {
      $project: {
        _id: 0,
        patient: 1,
        recordCount: 1,
        lastVisitDate: 1,
      },
    },
  ]);

  res.json(groups);
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await ClinicalRecord.findById(req.params.id).populate('patient');
  if (!record) {
    return res.status(404).json({ message: 'Record not found' });
  }
  res.json(record);
});

const getRecordByToken = asyncHandler(async (req, res) => {
  const record = await ClinicalRecord.findOne({ token: req.params.tokenId }).populate('patient');
  if (!record) {
    return res.status(404).json({ message: 'Record not found' });
  }
  res.json(record);
});

const deleteRecord = asyncHandler(async (req, res) => {
  const record = await ClinicalRecord.findByIdAndDelete(req.params.id);
  if (!record) {
    return res.status(404).json({ message: 'Record not found' });
  }
  res.json({ message: 'Record deleted' });
});

module.exports = {
  createRecord,
  getPatientRecords,
  getAllRecords,
  getPatientsWithRecords,
  getRecordById,
  getRecordByToken,
  deleteRecord,
};
