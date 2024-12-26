export const TRANSACTION_CATEGORIES = [
  { id: 'late_payment_fee', label: 'LATE PAYMENT FEE' },
  { id: 'administrative_fees', label: 'Administrative Fees' },
  { id: 'vehicle_damage_charge', label: 'Vehicle Damage Charge' },
  { id: 'traffic_fine', label: 'Traffic Fine' },
  { id: 'rental_fee', label: 'RENTAL FEE' },
  { id: 'advance_payment', label: 'Advance Payment' },
  { id: 'other', label: 'Other' }
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number]['id'];