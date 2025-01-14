export const calculateDueAmount = (payment: { 
  amount: number; 
  late_fine_amount?: number; 
  amount_paid?: number;
}) => {
  const totalDue = payment.amount + (payment.late_fine_amount || 0);
  const amountPaid = payment.amount_paid || 0;
  return Math.max(0, totalDue - amountPaid);
};