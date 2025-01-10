export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface PaymentRequest {
  leaseId: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  description?: string;
  type: string;
  paymentDate?: string;
}

export interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  status: PaymentStatus;
  paymentDate?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: PaymentMethodType;
  description?: string;
  type: string;
}