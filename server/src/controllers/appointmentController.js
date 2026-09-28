const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const getTodayDateString = require('../utils/getTodayDateString');
const { issueToken } = require('../services/tokenService');

const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, scheduledDate, scheduledTime, notes } = req.body;

  if (!patientId || !scheduledDate || !scheduledTime) {
    return res.status(400).json({ message: 'patientId, scheduledDate, and scheduledTime are required' });
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const appointment = await Appointment.create({
    patient: patient._id,
    scheduledDate,
    scheduledTime,
    notes,
    createdBy: req.user.id,
  });

  const populated = await appointment.populate('patient');
  res.status(201).json(populated);
});

const TOKEN_POPULATE = { path: 'token', populate: { path: 'patient' } };

const getAppointments = asyncHandler(async (req, res) => {
  const date = req.query.date || getTodayDateString();
  const appointments = await Appointment.find({ scheduledDate: date })
    .sort({ scheduledTime: 1 })
    .populate('patient')
    .populate(TOKEN_POPULATE);
  res.json(appointments);
});

const checkIn = asyncHandler(async (req, res) => {
  const { fee } = req.body;

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (appointment.status !== 'scheduled') {
    return res.status(400).json({ message: `Appointment is already ${appointment.status}` });
  }

  // force: true -- checking in for a pre-scheduled appointment is always a deliberate
  // visit, even if the patient also has an unrelated walk-in token earlier today.
  const token = await issueToken({ patientId: appointment.patient, fee, createdBy: req.user.id, force: true });
  if (!token) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  appointment.status = 'checked-in';
  appointment.token = token._id;
  await appointment.save();

  const populated = await appointment.populate(['patient', TOKEN_POPULATE]);
  res.json(populated);
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (appointment.status !== 'scheduled') {
    return res.status(400).json({ message: `Appointment is already ${appointment.status}` });
  }

  appointment.status = 'cancelled';
  await appointment.save();

  res.json(appointment);
});

module.exports = { createAppointment, getAppointments, checkIn, cancelAppointment };
