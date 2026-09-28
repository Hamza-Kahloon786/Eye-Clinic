const Medicine = require('../models/Medicine');
const asyncHandler = require('../utils/asyncHandler');

const getMedicines = asyncHandler(async (req, res) => {
  const { query } = req.query;

  const filter = {};
  if (query && query.trim()) {
    const q = query.trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: regex }, { genericName: regex }, { productCode: regex }];
  }

  const medicines = await Medicine.find(filter).sort({ name: 1 });
  res.json(medicines);
});

function buildFields(body) {
  const { productCode, name, genericName, packing, retailPrice, tradePrice, stockQuantity, lowStockThreshold } = body;
  return {
    productCode,
    name: name?.trim(),
    genericName,
    packing,
    retailPrice: retailPrice === '' || retailPrice == null ? undefined : Number(retailPrice),
    tradePrice: tradePrice === '' || tradePrice == null ? undefined : Number(tradePrice),
    stockQuantity: stockQuantity === '' || stockQuantity == null ? 0 : Number(stockQuantity),
    lowStockThreshold: lowStockThreshold === '' || lowStockThreshold == null ? 10 : Number(lowStockThreshold),
  };
}

const createMedicine = asyncHandler(async (req, res) => {
  const fields = buildFields(req.body);
  if (!fields.name) {
    return res.status(400).json({ message: 'name is required' });
  }

  const escaped = fields.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const existing = await Medicine.findOne({ name: new RegExp(`^${escaped}$`, 'i') });
  if (existing) {
    return res.status(409).json({ message: 'A medicine with this name already exists' });
  }

  const medicine = await Medicine.create(fields);
  res.status(201).json(medicine);
});

const updateMedicine = asyncHandler(async (req, res) => {
  const fields = buildFields(req.body);
  if (!fields.name) {
    return res.status(400).json({ message: 'name is required' });
  }

  const escaped = fields.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const duplicate = await Medicine.findOne({
    _id: { $ne: req.params.id },
    name: new RegExp(`^${escaped}$`, 'i'),
  });
  if (duplicate) {
    return res.status(409).json({ message: 'A medicine with this name already exists' });
  }

  const medicine = await Medicine.findByIdAndUpdate(req.params.id, fields, {
    new: true,
    runValidators: true,
  });
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  res.json(medicine);
});

const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  res.json({ message: 'Medicine deleted' });
});

module.exports = { getMedicines, createMedicine, updateMedicine, deleteMedicine };
