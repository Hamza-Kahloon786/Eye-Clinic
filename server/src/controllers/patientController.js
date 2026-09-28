const Patient = require('../models/Patient');
const Token = require('../models/Token');
const asyncHandler = require('../utils/asyncHandler');
const { generateMrNumber } = require('../utils/generateMrNumber');

const searchPatients = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.json([]);
  }

  const q = query.trim();
  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const patients = await Patient.find({
    $or: [{ fullName: regex }, { phone: regex }, { mrNumber: q.toUpperCase() }],
  }).limit(20);

  res.json(patients);
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const createPatient = asyncHandler(async (req, res) => {
  const { fullName, guardianName, age, gender, phone, address } = req.body;

  if (!fullName || age === undefined || !gender || !phone || !guardianName || !address) {
    return res.status(400).json({
      message: 'fullName, guardianName, age, gender, phone, and address are all required',
    });
  }

  const duplicate = await Patient.findOne({
    fullName: new RegExp(`^${escapeRegex(fullName.trim())}$`, 'i'),
    age: Number(age),
    phone: phone.trim(),
  });
  if (duplicate) {
    return res.status(409).json({
      message: `A patient with this name, age, and phone number already exists (${duplicate.mrNumber})`,
    });
  }

  const mrNumber = await generateMrNumber();

  const patient = await Patient.create({
    mrNumber,
    fullName,
    guardianName,
    age,
    gender,
    phone,
    address,
  });

  res.status(201).json(patient);
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  res.json(patient);
});

const updatePatient = asyncHandler(async (req, res) => {
  const { fullName, guardianName, age, gender, phone, address } = req.body;

  if (!fullName || age === undefined || !gender || !phone || !guardianName || !address) {
    return res.status(400).json({
      message: 'fullName, guardianName, age, gender, phone, and address are all required',
    });
  }

  const duplicate = await Patient.findOne({
    _id: { $ne: req.params.id },
    fullName: new RegExp(`^${escapeRegex(fullName.trim())}$`, 'i'),
    age: Number(age),
    phone: phone.trim(),
  });
  if (duplicate) {
    return res.status(409).json({
      message: `A patient with this name, age, and phone number already exists (${duplicate.mrNumber})`,
    });
  }

  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    { fullName, guardianName, age, gender, phone, address },
    { new: true, runValidators: true }
  );

  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  res.json(patient);
});

const getPatientTokens = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const tokens = await Token.find({ patient: patient._id }).sort({ date: -1, tokenNumber: -1 });
  res.json(tokens);
});

module.exports = {
  searchPatients,
  createPatient,
  getPatientById,
  updatePatient,
  getPatientTokens,
};
