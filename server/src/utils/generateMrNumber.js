const Counter = require('../models/Counter');
const { getTodayDateString } = require('./getTodayDateString');

async function getNextSequence(key) {
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// MR-YY-MM-NNNN -- the month shown is always the real registration month, but the
// NNNN sequence is keyed per-year (not per-month), so it keeps counting across
// month boundaries within the same year and only resets on January 1st.
async function generateMrNumber() {
  const [yyyy, mm] = getTodayDateString().split('-');
  const yy = yyyy.slice(-2);

  const seq = await getNextSequence(`mrNumber-${yy}`);
  return `MR-${yy}-${mm}-${String(seq).padStart(4, '0')}`;
}

module.exports = { generateMrNumber, getNextSequence };
