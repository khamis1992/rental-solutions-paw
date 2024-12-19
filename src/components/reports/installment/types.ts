export interface InstallmentImportRow {
  'N°cheque': string;
  'Amount': string;
  'Date': string;
  'Drawee Bank': string;
  'sold': string;
}

export interface CurrentInstallment {
  id: string;
  chequeNumber: string;
  amount: number;
  dueDate: string;
  bank: string;
  status: 'pending' | 'paid' | 'overdue';
}