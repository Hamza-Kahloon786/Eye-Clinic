const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const getTodayDateString = require('../utils/getTodayDateString');
const { getNextSequence } = require('../utils/generateMrNumber');

const createSale = asyncHandler(async (req, res) => {
  const { medicineId, patientId, quantity } = req.body;

  if (!medicineId || !patientId || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ message: 'medicineId, patientId, and a positive quantity are required' });
  }

  const qty = Number(quantity);

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  if (qty > (medicine.stockQuantity || 0)) {
    return res.status(400).json({ message: 'Insufficient stock for this quantity' });
  }

  const unitPrice = medicine.retailPrice || 0;
  const totalAmount = unitPrice * qty;

  // $set via findByIdAndUpdate (not Object.assign + .save()) so the write is
  // guaranteed to persist -- Mongoose's document-level dirty tracking has proven
  // unreliable for this pattern elsewhere in this codebase.
  const updatedMedicine = await Medicine.findByIdAndUpdate(
    medicineId,
    { $set: { stockQuantity: medicine.stockQuantity - qty } },
    { new: true, runValidators: true }
  );

  // Shared Counter-based sequence (same mechanism as MR numbers), all-time running
  // count -- never resets -- so printed receipts never collide or repeat.
  const seq = await getNextSequence('saleInvoice');
  const invoiceNumber = `INV-${String(seq).padStart(5, '0')}`;

  const sale = await Sale.create({
    invoiceNumber,
    medicine: medicine._id,
    medicineName: medicine.name,
    patient: patient._id,
    quantity: qty,
    unitPrice,
    totalAmount,
    soldBy: req.user.id,
  });

  const populated = await sale.populate([
    { path: 'patient' },
    { path: 'soldBy', select: 'fullName' },
  ]);

  res.status(201).json({ sale: populated, medicine: updatedMedicine });
});

const getSales = asyncHandler(async (req, res) => {
  const { query, date } = req.query;

  const filter = {};

  if (query && query.trim()) {
    const q = query.trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const patients = await Patient.find({
      $or: [{ fullName: regex }, { phone: regex }, { mrNumber: q.toUpperCase() }],
    }).select('_id');
    filter.patient = { $in: patients.map((p) => p._id) };
  }

  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    filter.createdAt = { $gte: start, $lte: end };
  }

  const sales = await Sale.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .populate('patient')
    .populate('soldBy', 'fullName');

  res.json(sales);
});

const getSalesStats = asyncHandler(async (req, res) => {
  const today = getTodayDateString();
  const start = new Date(`${today}T00:00:00`);
  const end = new Date(`${today}T23:59:59.999`);

  const [todayAgg, totalAgg, lowStockMedicines] = await Promise.all([
    Sale.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Medicine.find({ $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] } })
      .select('name stockQuantity lowStockThreshold')
      .sort({ stockQuantity: 1 }),
  ]);

  res.json({
    pharmacyRevenueToday: todayAgg[0]?.total || 0,
    pharmacyRevenueTotal: totalAgg[0]?.total || 0,
    lowStockMedicines,
  });
});

module.exports = { createSale, getSales, getSalesStats };
