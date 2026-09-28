// Server-local date as 'YYYY-MM-DD'. This app only ever runs on-site,
// so the server's local clock is clinic time -- no timezone handling needed.
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = getTodayDateString;
