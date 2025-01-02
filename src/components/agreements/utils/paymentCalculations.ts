export const calculateMonthlyPayment = (
  totalAmount: number,
  downPayment = 0,
  interestRate = 0,
  leaseDuration = 12
): number => {
  const loanAmount = totalAmount - downPayment;
  const monthlyInterestRate = (interestRate / 100) / 12;
  
  if (interestRate === 0) {
    return loanAmount / leaseDuration;
  }

  const monthlyPayment = 
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, leaseDuration)) / 
    (Math.pow(1 + monthlyInterestRate, leaseDuration) - 1);

  return Number(monthlyPayment.toFixed(2));
};