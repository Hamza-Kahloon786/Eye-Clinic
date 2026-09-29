// The clinic operates in Pakistan, so "today" is always computed in Asia/Karachi
// (UTC+5) regardless of the viewer's own device timezone -- matching the server's
// getTodayDateString(), which is pinned the same way. Without this, a browser set to
// a different timezone would silently disagree with the server about what day it is.
const CLINIC_TIMEZONE = 'Asia/Karachi';

function formatDateString(date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // en-CA formats as YYYY-MM-DD
}

// 'YYYY-MM-DD' in clinic (Pakistan) local time, matching the server's date-string convention.
export function getTodayDateString(date = new Date()) {
  return formatDateString(date);
}
