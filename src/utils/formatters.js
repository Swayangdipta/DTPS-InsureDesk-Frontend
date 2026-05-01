import dayjs from 'dayjs';

// ── Dates ─────────────────────────────────────────────────
export const formatDate = (date, fmt = 'DD MMM YYYY') =>
  date ? dayjs(date).format(fmt) : '—';

export const formatDateShort = (date) =>
  date ? dayjs(date).format('DD/MM/YY') : '—';

export const fromNow = (date) =>
  date ? dayjs(date).fromNow() : '—';

export const daysUntil = (date) =>
  date ? dayjs(date).diff(dayjs(), 'day') : null;

// ── Currency ──────────────────────────────────────────────
export const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatNumber = (num = 0) =>
  new Intl.NumberFormat('en-IN').format(num);

// ── Compact large numbers (for KPI cards) ────────────────
export const formatCompact = (num = 0) => {
  if (num >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(1)}Cr`;
  if (num >= 1_00_000)    return `₹${(num / 1_00_000).toFixed(1)}L`;
  if (num >= 1_000)       return `₹${(num / 1_000).toFixed(1)}K`;
  return `₹${num}`;
};

// ── String helpers ────────────────────────────────────────
export const truncate = (str = '', len = 30) =>
  str.length > len ? `${str.slice(0, len)}…` : str;

export const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
