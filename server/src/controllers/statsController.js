const Token = require('../models/Token');
const Appointment = require('../models/Appointment');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const asyncHandler = require('../utils/asyncHandler');
const getTodayDateString = require('../utils/getTodayDateString');

const TREND_DAYS = 14;

function dateStringDaysAgo(days) {
  // Subtracting whole days from "now" and re-deriving the Pakistan-local date string
  // works fine across the UTC+5 offset -- a day is always 24h regardless of timezone.
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getTodayDateString(d);
}

const getDashboardStats = asyncHandler(async (req, res) => {
  const today = getTodayDateString();
  const rangeStart = dateStringDaysAgo(TREND_DAYS - 1);

  const todayStart = new Date(`${today}T00:00:00`);
  const todayEnd = new Date(`${today}T23:59:59.999`);

  const [
    patientsPerDayRaw,
    queueStatusByDayRaw,
    topDiagnosesRaw,
    appointmentsSummaryRaw,
    pharmacyRevenueTodayRaw,
    pharmacyRevenueTotalRaw,
    lowStockMedicines,
  ] = await Promise.all([
    Token.aggregate([
      { $match: { date: { $gte: rangeStart, $lte: today } } },
      { $group: { _id: '$date', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Token.aggregate([
      { $match: { date: { $gte: rangeStart, $lte: today } } },
      { $group: { _id: { date: '$date', status: '$status' }, count: { $sum: 1 } } },
    ]),
    Token.aggregate([
      { $match: { diagnosis: { $exists: true, $nin: [null, ''] } } },
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Appointment.aggregate([
      { $match: { scheduledDate: { $gte: rangeStart, $lte: today } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Medicine.find({ $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] } })
      .select('name stockQuantity lowStockThreshold')
      .sort({ stockQuantity: 1 }),
  ]);

  const patientsPerDay = patientsPerDayRaw.map((d) => ({ date: d._id, count: d.count }));

  // Per-day queue status breakdown over the trend window, so the client can sum any
  // sub-range (e.g. today only, last 7 days, last 14 days) without another round trip.
  const queueStatusByDay = queueStatusByDayRaw.map((d) => ({
    date: d._id.date,
    status: d._id.status,
    count: d.count,
  }));

  const queueStatusToday = { waiting: 0, 'in-progress': 0, done: 0 };
  queueStatusByDay
    .filter((d) => d.date === today)
    .forEach((d) => {
      queueStatusToday[d.status] = d.count;
    });

  const topDiagnoses = topDiagnosesRaw.map((d) => ({ diagnosis: d._id, count: d.count }));

  const appointmentsSummary = { scheduled: 0, 'checked-in': 0, cancelled: 0 };
  appointmentsSummaryRaw.forEach((d) => {
    appointmentsSummary[d._id] = d.count;
  });

  res.json({
    patientsPerDay,
    queueStatusToday,
    queueStatusByDay,
    topDiagnoses,
    appointmentsSummary,
    pharmacyRevenueToday: pharmacyRevenueTodayRaw[0]?.total || 0,
    pharmacyRevenueTotal: pharmacyRevenueTotalRaw[0]?.total || 0,
    lowStockMedicines,
  });
});

module.exports = { getDashboardStats };
