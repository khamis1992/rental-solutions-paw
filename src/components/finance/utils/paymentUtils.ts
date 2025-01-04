import { PaymentMethodType } from "@/types/database/payment.types";

export const normalizePaymentMethod = (method: string): PaymentMethodType => {
  const methodMap: Record<string, PaymentMethodType> = {
    'cash': 'Cash',
    'invoice': 'Invoice',
    'wire': 'WireTransfer',
    'wiretransfer': 'WireTransfer',
    'cheque': 'Cheque',
    'check': 'Cheque',
    'deposit': 'Deposit',
    'onhold': 'On_hold',
    'on_hold': 'On_hold',
    'on-hold': 'On_hold'
  };

  const normalized = method.toLowerCase().replace(/[^a-z]/g, '');
  return methodMap[normalized] || 'Cash';
};