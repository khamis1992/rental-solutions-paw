import { addMonths, addWeeks, format } from "date-fns";

interface PaymentScheduleItem {
  dueDate: Date;
  amount: number;
  remainingBalance: number;
}

interface PaymentCalculation {
  totalAmount: number;
  schedule: PaymentScheduleItem[];
}

type PaymentFrequency = "weekly" | "monthly";

export function calculatePayment(
  rentalAmount: number,
  rate: number, // Annual interest rate as percentage (e.g., 5 for 5%)
  frequency: PaymentFrequency,
  startDate: Date = new Date(),
  durationMonths: number = 12
): PaymentCalculation {
  // Convert annual rate to decimal and period rate
  const annualRate = rate / 100;
  const periodsPerYear = frequency === "weekly" ? 52 : 12;
  const periodRate = annualRate / periodsPerYear;
  
  // Calculate total number of payments
  const totalPeriods = frequency === "weekly" 
    ? Math.floor(durationMonths * (52/12)) 
    : durationMonths;

  // Calculate payment amount using loan payment formula
  // PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  // where P = principal, r = period rate, n = total periods
  const payment = rentalAmount * 
    (periodRate * Math.pow(1 + periodRate, totalPeriods)) / 
    (Math.pow(1 + periodRate, totalPeriods) - 1);

  const schedule: PaymentScheduleItem[] = [];
  let remainingBalance = rentalAmount;
  let currentDate = startDate;

  // Generate payment schedule
  for (let i = 0; i < totalPeriods; i++) {
    const interestPayment = remainingBalance * periodRate;
    const principalPayment = payment - interestPayment;
    remainingBalance -= principalPayment;

    schedule.push({
      dueDate: currentDate,
      amount: Number(payment.toFixed(2)),
      remainingBalance: Number(Math.max(0, remainingBalance).toFixed(2))
    });

    // Increment date based on frequency
    currentDate = frequency === "weekly" 
      ? addWeeks(currentDate, 1)
      : addMonths(currentDate, 1);
  }

  return {
    totalAmount: Number((payment * totalPeriods).toFixed(2)),
    schedule
  };
}

// Helper function to format currency
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Example usage:
// const result = calculatePayment(10000, 5, "monthly", new Date(), 12);
// console.log("Total Amount:", formatAmount(result.totalAmount));
// console.log("Payment Schedule:", result.schedule);