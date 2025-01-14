export const calculateDueAmount = (payment: { 
  amount: number; 
  late_fine_amount?: number; 
  amount_paid?: number;
}) => {
  const totalDue = payment.amount + (payment.late_fine_amount || 0);
  const amountPaid = payment.amount_paid || 0;
  return Math.max(0, totalDue - amountPaid);
};

export const calculateMonthlyPayment = (
  totalAmount: number,
  downPayment: number,
  interestRate: number,
  leaseDuration: number
): number => {
  // Convert annual interest rate to monthly
  const monthlyRate = (interestRate / 100) / 12;
  
  // Calculate remaining amount after down payment
  const principal = totalAmount - downPayment;
  
  // If no interest or duration is 1 month or less, return simple division
  if (monthlyRate === 0 || leaseDuration <= 1) {
    return principal / Math.max(1, leaseDuration);
  }
  
  // Use the PMT formula: PMT = P * (r(1+r)^n)/((1+r)^n-1)
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, leaseDuration);
  const denominator = Math.pow(1 + monthlyRate, leaseDuration) - 1;
  
  return principal * (numerator / denominator);
};

export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate.split('/').reverse().join('-'));
  const end = new Date(endDate.split('/').reverse().join('-'));
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return diffMonths;
};

export const calculateContractValue = (rentAmount: number, duration: number): number => {
  return rentAmount * duration;
};