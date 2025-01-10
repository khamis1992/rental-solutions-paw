export interface PaymentRequest {
  operation: string;
  data: {
    leaseId: string;
    amount: number;
    paymentMethod: string;
    description?: string;
    type: 'Income' | 'Expense';
  };
}

export interface LeaseVerificationResult {
  id: string;
  agreement_number: string;
  customer_id: string;
  profiles: {
    id: string;
    full_name: string;
  };
}