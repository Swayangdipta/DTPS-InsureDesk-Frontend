import {
  getPaymentBadge,
  getBondBadge,
  getPayoutBadge,
} from '@/utils/rowColor';

// Generic badge
export function Badge({ label, className = '' }) {
  return (
    <span className={`badge ${className}`}>{label}</span>
  );
}

// Typed badges — auto-apply correct colors
export function PaymentBadge({ status }) {
  return <span className={`badge ${getPaymentBadge(status)}`}>{status}</span>;
}

export function BondBadge({ status }) {
  return <span className={`badge ${getBondBadge(status)}`}>{status}</span>;
}

export function PayoutBadge({ status }) {
  return <span className={`badge ${getPayoutBadge(status)}`}>{status}</span>;
}

// Category badge — uses the colorCode from DB
export function CategoryBadge({ name, colorCode = '#6366f1' }) {
  return (
    <span
      className="badge text-white text-xs"
      style={{ backgroundColor: colorCode }}
    >
      {name}
    </span>
  );
}
