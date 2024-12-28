export interface ImportedTransaction {
  agreement_number: string;
  customer_name: string;
  amount: number;
  license_plate: string;
  vehicle: string;
  payment_date: string;
  payment_method: string;
  payment_number: string;
  description: string;
}

export interface RawTransactionImport {
  id: string;
  import_id: string | null;
  raw_data: ImportedTransaction;
  error_description: string | null;
  is_valid: boolean;
  created_at: string;
}