// Maps the rowColor virtual (from backend) to Tailwind CSS classes
// Used in the policy table and any card that shows status

export const ROW_COLOR_CLASSES = {
  green:   'row-green',
  yellow:  'row-yellow',
  red:     'row-red',
  default: 'row-default',
};

export const getRowClass = (rowColor = 'default') =>
  ROW_COLOR_CLASSES[rowColor] ?? ROW_COLOR_CLASSES.default;

// Badge colors for payment status chips
export const PAYMENT_STATUS_BADGE = {
  Paid:    'bg-green-100  text-green-800',
  Unpaid:  'bg-gray-100   text-gray-700',
  Bounced: 'bg-red-100    text-red-800',
  Partial: 'bg-yellow-100 text-yellow-800',
};

export const BOND_STATUS_BADGE = {
  Pending:    'bg-yellow-100 text-yellow-800',
  Received:   'bg-green-100  text-green-800',
  Dispatched: 'bg-blue-100   text-blue-800',
  NA:         'bg-gray-100   text-gray-600',
};

export const PAYOUT_STATUS_BADGE = {
  Due:  'bg-orange-100 text-orange-800',
  Paid: 'bg-green-100  text-green-800',
  NA:   'bg-gray-100   text-gray-600',
};

export const getPaymentBadge  = (s) => PAYMENT_STATUS_BADGE[s]  ?? 'bg-gray-100 text-gray-700';
export const getBondBadge     = (s) => BOND_STATUS_BADGE[s]     ?? 'bg-gray-100 text-gray-600';
export const getPayoutBadge   = (s) => PAYOUT_STATUS_BADGE[s]   ?? 'bg-gray-100 text-gray-600';
