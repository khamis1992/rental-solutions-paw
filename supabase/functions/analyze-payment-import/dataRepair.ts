import { PaymentData } from './types';

export const repairDate = (dateStr: string): { value: string; wasRepaired: boolean; error?: string } => {
  try {
    const cleanDate = dateStr.trim().replace(/['"]/g, '');
    
    // Handle different date formats
    const formats = [
      { regex: /^(\d{2})[/-](\d{2})[/-](\d{4})$/, format: 'DD-MM-YYYY' },
      { regex: /^(\d{4})[/-](\d{2})[/-](\d{2})$/, format: 'YYYY-MM-DD' },
      { regex: /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/, format: 'D-M-YYYY' }
    ];

    for (const { regex, format } of formats) {
      const match = cleanDate.match(regex);
      if (match) {
        let [_, part1, part2, part3] = match;
        if (format === 'DD-MM-YYYY') {
          return { 
            value: `${part1.padStart(2, '0')}-${part2.padStart(2, '0')}-${part3}`, 
            wasRepaired: true 
          };
        } else if (format === 'YYYY-MM-DD') {
          return { 
            value: `${part3.padStart(2, '0')}-${part2.padStart(2, '0')}-${part1}`, 
            wasRepaired: true 
          };
        } else {
          return { 
            value: `${part1.padStart(2, '0')}-${part2.padStart(2, '0')}-${part3}`, 
            wasRepaired: true 
          };
        }
      }
    }

    return { 
      value: dateStr, 
      wasRepaired: false, 
      error: 'Invalid date format. Expected DD-MM-YYYY' 
    };
  } catch (error) {
    return { 
      value: dateStr, 
      wasRepaired: false, 
      error: 'Date parsing error' 
    };
  }
};

export const repairAmount = (amount: string): { value: string; wasRepaired: boolean; error?: string } => {
  try {
    // Remove currency symbols, spaces, and commas
    const cleanAmount = amount.trim()
      .replace(/[^\d.-]/g, '')
      .replace(/,/g, '');
    
    // Parse as float to validate
    const numAmount = parseFloat(cleanAmount);
    if (isNaN(numAmount)) {
      return { 
        value: amount, 
        wasRepaired: false, 
        error: 'Invalid amount format' 
      };
    }

    return { 
      value: numAmount.toFixed(2), 
      wasRepaired: cleanAmount !== amount 
    };
  } catch (error) {
    return { 
      value: amount, 
      wasRepaired: false, 
      error: 'Amount parsing error' 
    };
  }
};

export const repairPaymentMethod = (method: string): { value: string; wasRepaired: boolean } => {
  const validMethods = ['cash', 'credit_card', 'bank_transfer', 'cheque'];
  const normalized = method.toLowerCase().trim()
    .replace(/\s+/g, '_')
    .replace(/[-]/g, '_');

  if (validMethods.includes(normalized)) {
    return { value: normalized, wasRepaired: normalized !== method };
  }

  // Try to match common variations
  const methodMap: Record<string, string> = {
    'card': 'credit_card',
    'cc': 'credit_card',
    'wire': 'bank_transfer',
    'transfer': 'bank_transfer',
    'check': 'cheque'
  };

  for (const [key, value] of Object.entries(methodMap)) {
    if (normalized.includes(key)) {
      return { value, wasRepaired: true };
    }
  }

  return { value: 'cash', wasRepaired: true }; // Default to cash if unknown
};

export const repairStatus = (status: string): { value: string; wasRepaired: boolean } => {
  const validStatuses = ['pending', 'completed', 'failed'];
  const normalized = status.toLowerCase().trim();

  if (validStatuses.includes(normalized)) {
    return { value: normalized, wasRepaired: normalized !== status };
  }

  // Map common variations
  const statusMap: Record<string, string> = {
    'success': 'completed',
    'successful': 'completed',
    'done': 'completed',
    'paid': 'completed',
    'fail': 'failed',
    'error': 'failed',
    'cancelled': 'failed',
    'pending': 'pending',
    'processing': 'pending',
    'waiting': 'pending'
  };

  for (const [key, value] of Object.entries(statusMap)) {
    if (normalized.includes(key)) {
      return { value, wasRepaired: true };
    }
  }

  return { value: 'pending', wasRepaired: true }; // Default to pending if unknown
};