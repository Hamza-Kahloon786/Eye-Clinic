const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const getTodayDateString = require('../utils/getTodayDateString');
const { getNextSequence } = require('../utils/generateMrNumber');

const createSale = asyncHandler(async (req, res) => {
  const { patientId, items } = req.body;

  if (!patientId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'patientId and a non-empty items array are required' });
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  // Normalize + validate every line before writing anything -- a multi-item cart
  // should report every problem at once (e.g. two medicines short on stock),
  // not fail on the first one and leave the receptionist guessing about the rest.
  const normalized = [];
  const errors = [];

  for (const item of items) {
    const medicineId = item?.medicineId;
    const quantity = Number(item?.quantity);

    if (!medicineId || !Number.isFinite(quantity) || quantity <= 0) {
      errors.push('Each item requires a medicineId and a positive quantity');
      continue;
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      errors.push(`Medicine not found (${medicineId})`);
      continue;
    }

    if (quantity > (medicine.stockQuantity || 0)) {
      errors.push(`Insufficient stock for ${medicine.name} (requested ${quantity}, in stock ${medicine.stockQuantity || 0})`);
      continue;
    }

    normalized.push({ medicine, quantity });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('; ') });
  }

  // All lines validated -- now apply the writes.
  const saleItems = [];
  const updatedMedicines = [];

  for (const { medicine, quantity } of normalized) {
    const unitPrice = medicine.retailPrice || 0;
    const totalAmount = unitPrice * quantity;

    // $set via findByIdAndUpdate (not Object.assign + .save()) so the write is
    // guaranteed to persist -- Mongoose's document-level dirty tracking has proven
    // unreliable for this pattern elsewhere in this codebase.
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      medicine._id,
      { $set: { stockQuantity: medicine.stockQuantity - quantity } },
      { new: true, runValidators: true }
    );
    updatedMedicines.push(updatedMedicine);

    saleItems.push({
      medicine: medicine._id,
      medicineName: medicine.name,
      quantity,
      unitPrice,
      totalAmount,
    });
  }

  const grandTotal = saleItems.reduce((sum, item) => sum + item.totalAmount, 0);

  // Shared Counter-based sequence (same mechanism as MR numbers), all-time running
  // count -- never resets -- so printed receipts never collide or repeat.
  const seq = await getNextSequence('saleInvoice');
  const invoiceNumber = `INV-${String(seq).padStart(5, '0')}`;

  const sale = await Sale.create({
    invoiceNumber,
    items: saleItems,
    grandTotal,
    patient: patient._id,
    soldBy: req.user.id,
  });

  const populated = await sale.populate([
    { path: 'patient' },
    { path: 'soldBy', select: 'fullName' },
  ]);

  res.status(201).json({ sale: populated, medicines: updatedMedicines });
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
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
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
