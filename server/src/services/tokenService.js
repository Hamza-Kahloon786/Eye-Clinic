const Token = require('../models/Token');
const Patient = require('../models/Patient');
const getTodayDateString = require('../utils/getTodayDateString');
const { getNextSequence } = require('../utils/generateMrNumber');

const DEFAULT_FEE = 1000;

// Shared by walk-in token generation (POST /api/tokens) and appointment
// check-in -- both need the same collision-safe daily/serial numbering.
async function issueToken({ patientId, fee, createdBy }) {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    return null;
  }

  const date = getTodayDateString();
  const [tokenNumber, serialNumber] = await Promise.all([
    getNextSequence(date),
    getNextSequence('tokenSerial'),
  ]);

  const token = await Token.create({
    patient: patient._id,
    tokenNumber,
    serialNumber,
    fee: Number.isFinite(Number(fee)) && Number(fee) >= 0 ? Number(fee) : DEFAULT_FEE,
    date,
    createdBy,
  });

  return token.populate('patient');
}

module.exports = { issueToken, DEFAULT_FEE };
