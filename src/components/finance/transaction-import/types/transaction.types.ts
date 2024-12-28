/**
 * Represents a transaction imported from CSV
 */
export interface ImportedTransaction {
  /** Unique identifier for the agreement (format: AGR-YYYYMM-XXXX) */
  agreement_number: string;
  
  /** Full name of the customer associated with the transaction */
  customer_name: string;
  
  /** Payment amount received (income) */
  amount: number;
  
  /** Vehicle license plate number */
  license_plate: string;
  
  /** Vehicle make and model */
  vehicle: string;
  
  /** Date when the payment was made */
  payment_date: string;
  
  /** Method used for payment (e.g., cash, card, bank transfer) */
  payment_method: string;
  
  /** Unique identifier for the payment */
  payment_number: string;
  
  /** Additional details about the payment */
  description: string;
}

/**
 * Represents a raw transaction import record in the database
 */
export interface RawTransactionImport {
  /** Unique identifier for the import record */
  id: string;
  
  /** Reference to the import batch ID */
  import_id: string | null;
  
  /** The actual transaction data */
  raw_data: ImportedTransaction;
  
  /** Description of any errors encountered during import */
  error_description: string | null;
  
  /** Indicates if the import was successful */
  is_valid: boolean;
  
  /** Timestamp of when the record was created */
  created_at: string;
}