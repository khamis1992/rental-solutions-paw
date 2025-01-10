export type PaymentMethodType = 'Cash' | 'WireTransfer' | 'Cheque' | 'Invoice' | 'Deposit' | 'On_hold';

export interface RawPaymentImport {
  id?: string;
  Agreement_Number?: string;
  Transaction_ID?: string;
  Customer_Name?: string;
  License_Plate?: string;
  Amount?: number;
  Payment_Method?: string;
  Description?: string;
  Payment_Date?: string;
  Type?: string;
  Status?: string;
  is_valid?: boolean;
  error_description?: string;
}
