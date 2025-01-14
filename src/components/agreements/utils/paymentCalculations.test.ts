import { describe, test, expect } from 'vitest';
import { calculateDueAmount, calculateMonthlyPayment } from './paymentCalculations';

describe('Payment Calculations', () => {
  test('calculateDueAmount should return correct amount when payment has late fine', () => {
    const payment = {
      amount: 1000,
      amount_paid: 500,
      late_fine_amount: 120
    };
    
    expect(calculateDueAmount(payment)).toBe(620); // 1000 + 120 - 500
  });

  test('calculateDueAmount should return 0 when payment is fully paid', () => {
    const payment = {
      amount: 1000,
      amount_paid: 1120,
      late_fine_amount: 120
    };
    
    expect(calculateDueAmount(payment)).toBe(0);
  });

  test('calculateDueAmount should handle missing late fine amount', () => {
    const payment = {
      amount: 1000,
      amount_paid: 500,
      late_fine_amount: undefined
    };
    
    expect(calculateDueAmount(payment)).toBe(500);
  });

  test('calculateMonthlyPayment should calculate correct monthly payment', () => {
    const totalAmount = 120000;
    const downPayment = 20000;
    const interestRate = 5; // 5%
    const leaseDuration = 12; // 12 months
    
    expect(calculateMonthlyPayment(totalAmount, downPayment, interestRate, leaseDuration)).toBeCloseTo(8560.75, 2);
  });
});