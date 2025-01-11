export type PaymentMethodType = 'Cash' | 'Invoice' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

export type PaymentCategoryType = 
  | 'LATE PAYMENT FEE'
  | 'Administrative Fees'
  | 'Vehicle Damage Charge'
  | 'Traffic Fine'
  | 'RENTAL FEE'
  | 'Advance Payment'
  | 'other';

export interface RawPaymentImport {
  id: string;
  Agreement_Number: string;
  Transaction_ID: string;
  Customer_Name: string;
  License_Plate: string;
  Amount: number;
  Payment_Method: PaymentMethodType;
  Description: string;
  Payment_Date: string;
  Type: string;
  Status: string;
  is_valid?: boolean;
  error_description?: string;
  created_at: string;
}
