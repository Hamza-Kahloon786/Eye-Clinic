const Counter = require('../models/Counter');

async function getNextSequence(key) {
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// MR-YY-MM-NNNN, sequence resets every month (e.g. MR-26-09-0001, next month MR-26-10-0001).
async function generateMrNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');

  const seq = await getNextSequence(`mrNumber-${yy}${mm}`);
  return `MR-${yy}-${mm}-${String(seq).padStart(4, '0')}`;
}

module.exports = { generateMrNumber, getNextSequence };
