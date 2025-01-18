import { PaymentStatus } from "@/types/agreement.types";

export const processPayment = (status: PaymentStatus) => {
  switch (status) {
    case 'completed':
      return {
        success: true,
        message: 'Payment processed successfully'
      };
    case 'pending':
      return {
        success: false,
        message: 'Payment is still pending'
      };
    case 'failed':
      return {
        success: false,
        message: 'Payment processing failed'
      };
    case 'refunded':
      return {
        success: true,
        message: 'Payment has been refunded'
      };
    default:
      return {
        success: false,
        message: 'Invalid payment status'
      };
  }
};

export const validatePayment = (status: PaymentStatus) => {
  const validStatuses: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid payment status: ${status}`);
  }
  return true;
};