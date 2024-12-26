export const TRANSACTION_CATEGORIES = [
  { id: '9d5a14eb-3fb7-4e0c-9b5e-6f8c0753c3e0', label: 'LATE PAYMENT FEE' },
  { id: 'b2c3a14e-3fb7-4e0c-9b5e-6f8c0753c3e1', label: 'Administrative Fees' },
  { id: 'c3d4a14e-3fb7-4e0c-9b5e-6f8c0753c3e2', label: 'Vehicle Damage Charge' },
  { id: 'd4e5a14e-3fb7-4e0c-9b5e-6f8c0753c3e3', label: 'Traffic Fine' },
  { id: 'e5f6a14e-3fb7-4e0c-9b5e-6f8c0753c3e4', label: 'RENTAL FEE' },
  { id: 'f6g7a14e-3fb7-4e0c-9b5e-6f8c0753c3e5', label: 'Advance Payment' },
  { id: 'g7h8a14e-3fb7-4e0c-9b5e-6f8c0753c3e6', label: 'Other' }
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number]['id'];