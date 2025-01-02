import { PaymentMethodType } from "@/types/database/payment.types";

/**
 * Interface representing payment calculation options
 * @interface PaymentCalculationOptions
 * @property {number} baseAmount - The base amount of the payment
 * @property {number} [lateFees] - Optional late fees to be added
 * @property {number} [discountPercentage] - Optional discount percentage to apply
 * @property {Date} [dueDate] - Optional due date for late fee calculations
 */
interface PaymentCalculationOptions {
  baseAmount: number;
  lateFees?: number;
  discountPercentage?: number;
  dueDate?: Date;
}

/**
 * Class responsible for handling payment calculations and validations
 * Provides methods for calculating total amounts, validating payments,
 * and formatting currency values according to Qatar standards.
 * 
 * @example
 * const calculator = new PaymentCalculator();
 * const total = calculator.calculateTotal({ baseAmount: 1000, lateFees: 50 });
 * console.log(calculator.formatAmount(total)); // "QAR 1,050.00"
 */
export class PaymentCalculator {
  /** Default currency code for Qatar */
  private readonly currencyCode = 'QAR';
  
  /** Minimum allowed payment amount */
  private readonly minimumAmount = 0;

  /**
   * Calculates the total payment amount including fees and discounts
   * 
   * @param {PaymentCalculationOptions} options - Payment calculation options
   * @returns {number} The calculated total amount
   * @throws {Error} If baseAmount is less than minimum allowed amount
   * 
   * @example
   * const total = calculator.calculateTotal({
   *   baseAmount: 1000,
   *   lateFees: 50,
   *   discountPercentage: 10
   * });
   */
  public calculateTotal(options: PaymentCalculationOptions): number {
    // Validate base amount
    if (options.baseAmount < this.minimumAmount) {
      throw new Error(`Amount must be greater than ${this.minimumAmount}`);
    }

    let total = options.baseAmount;

    // Add late fees if applicable
    if (options.lateFees && options.lateFees > 0) {
      total += options.lateFees;
    }

    // Apply discount if specified
    if (options.discountPercentage && options.discountPercentage > 0) {
      // Convert percentage to decimal and subtract from total
      const discountAmount = total * (options.discountPercentage / 100);
      total -= discountAmount;
    }

    return total;
  }

  /**
   * Validates a payment method against allowed types
   * 
   * @param {string} method - The payment method to validate
   * @returns {boolean} True if the payment method is valid
   * 
   * @example
   * if (calculator.isValidPaymentMethod('credit_card')) {
   *   // Process credit card payment
   * }
   */
  public isValidPaymentMethod(method: string): method is PaymentMethodType {
    // Define allowed payment methods
    const validMethods: PaymentMethodType[] = [
      'Invoice',
      'Cash',
      'WireTransfer',
      'Cheque',
      'Deposit',
      'On_hold'
    ];

    return validMethods.includes(method as PaymentMethodType);
  }

  /**
   * Formats a number as a currency string according to Qatar standards
   * 
   * @param {number} amount - The amount to format
   * @returns {string} Formatted currency string
   * 
   * @example
   * console.log(calculator.formatAmount(1000.50)); // "QAR 1,000.50"
   */
  public formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-QA', {
      style: 'currency',
      currency: this.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Calculates late fees based on the number of days overdue
   * 
   * @param {number} amount - Original payment amount
   * @param {Date} dueDate - Payment due date
   * @param {number} [dailyRate=0.001] - Daily late fee rate (defaults to 0.1%)
   * @returns {number} Calculated late fee amount
   * 
   * @example
   * const lateFee = calculator.calculateLateFees(1000, new Date('2024-01-01'));
   */
  public calculateLateFees(
    amount: number,
    dueDate: Date,
    dailyRate: number = 0.001
  ): number {
    // Get days overdue (only if payment is actually late)
    const today = new Date();
    const daysOverdue = dueDate < today 
      ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate late fees only if payment is overdue
    return daysOverdue > 0 ? amount * dailyRate * daysOverdue : 0;
  }
}

/**
 * Creates and exports a singleton instance of PaymentCalculator
 * This ensures consistent usage across the application
 * 
 * @example
 * import { paymentCalculator } from '@/lib/paymentCalculations';
 * const total = paymentCalculator.calculateTotal({ baseAmount: 1000 });
 */
export const paymentCalculator = new PaymentCalculator();