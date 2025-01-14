import { calculateDueAmount } from './paymentCalculations';

describe('calculateDueAmount', () => {
  test('calculates initial due amount correctly', () => {
    const payment = {
      amount: 1000,
      late_fine_amount: 120,
      amount_paid: 0
    };
    expect(calculateDueAmount(payment)).toBe(1120);
  });

  test('calculates remaining due amount after partial payment', () => {
    const payment = {
      amount: 1000,
      late_fine_amount: 120,
      amount_paid: 500
    };
    expect(calculateDueAmount(payment)).toBe(620);
  });

  test('returns 0 when payment is fully paid', () => {
    const payment = {
      amount: 1000,
      late_fine_amount: 120,
      amount_paid: 1120
    };
    expect(calculateDueAmount(payment)).toBe(0);
  });

  test('handles undefined values', () => {
    const payment = {
      amount: 1000,
      late_fine_amount: undefined,
      amount_paid: undefined
    };
    expect(calculateDueAmount(payment)).toBe(1000);
  });
});