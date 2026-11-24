const dayMs = 86_400_000;
const monthNames = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

// Billing dates are calendar days stored as "YYYY-MM-DD". They are handled as
// UTC midnight so the device time zone can never shift a date by one day.
function toUtcTime(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function toIsoDate(time: number) {
  return new Date(time).toISOString().slice(0, 10);
}

export function todayIsoDate(now = new Date()) {
  return toIsoDate(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function daysBetween(start: string, end: string) {
  return Math.round((toUtcTime(end) - toUtcTime(start)) / dayMs);
}

export function parseDisplayDate(text: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) {
    return null;
  }
  const [, day, month, year] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return toIsoDate(date.getTime());
}

export function formatDisplayDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function maskDateInput(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter(Boolean)
    .join("/");
}

function shortDate(isoDate: string, withYear: boolean) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const text = `${day} ${monthNames[month - 1]}`;
  return withYear ? `${text} ${year}` : text;
}

export function formatPeriod(start: string, end: string) {
  const crossesYear = start.slice(0, 4) !== end.slice(0, 4);
  return `${shortDate(start, crossesYear)} – ${shortDate(end, crossesYear)}`;
}

export function formatMonth(isoDate: string) {
  const name = monthNames[Number(isoDate.slice(5, 7)) - 1];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatPeriodWithYear(start: string, end: string) {
  const period = formatPeriod(start, end);
  return start.slice(0, 4) === end.slice(0, 4)
    ? `${period} ${end.slice(0, 4)}`
    : period;
}
