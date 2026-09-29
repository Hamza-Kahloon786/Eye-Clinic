// The clinic operates in Pakistan, so every "what day/time is it" calculation in
// this app is pinned to Asia/Karachi (UTC+5) -- regardless of which machine's local
// system clock is actually running the code (dev laptop, VPS, anywhere). Without
// this, "today" on one machine could silently disagree with "today" on another if
// their system timezones differ, splitting what should be the same day's data.
const CLINIC_TIMEZONE = 'Asia/Karachi';

function getKarachiParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }
  return parts;
}

// 'YYYY-MM-DD' in clinic (Pakistan) local time.
function getTodayDateString(date) {
  const { year, month, day } = getKarachiParts(date);
  return `${year}-${month}-${day}`;
}

// 'HH:mm' in clinic (Pakistan) local time.
function getNowTimeString(date) {
  const { hour, minute } = getKarachiParts(date);
  return `${hour}:${minute}`;
}

module.exports = getTodayDateString;
module.exports.getTodayDateString = getTodayDateString;
module.exports.getNowTimeString = getNowTimeString;
module.exports.CLINIC_TIMEZONE = CLINIC_TIMEZONE;
