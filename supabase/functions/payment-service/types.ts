export interface PaymentRequest {
  leaseId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  type: 'Income' | 'Expense';
}

export interface LeaseVerificationResult {
  id: string;
  agreement_number: string;
  customer: {
    id: string;
    full_name: string;
  };
}