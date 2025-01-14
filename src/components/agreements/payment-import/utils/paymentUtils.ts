export const REQUIRED_FIELDS = [
  'Transaction_ID',
  'Agreement_Number', 
  'Customer_Name',
  'License_Plate',
  'Amount',
  'Payment_Method',
  'Description',
  'Payment_Date',
  'Type'
];

export const validateHeaders = (headers: string[]) => {
  const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

export const normalizePaymentMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    'cash': 'Cash',
    'invoice': 'Invoice',
    'wire': 'WireTransfer',
    'wiretransfer': 'WireTransfer',
    'wire_transfer': 'WireTransfer',
    'cheque': 'Cheque',
    'check': 'Cheque',
    'deposit': 'Deposit',
    'onhold': 'On_hold',
    'on_hold': 'On_hold',
    'on-hold': 'On_hold'
  };

  const normalized = method.toLowerCase().replace(/[^a-z_]/g, '');
  return methodMap[normalized] || 'Cash';
};

export const formatDateForDB = (dateStr: string): string | null => {
  try {
    // Handle different date formats
    const formats = [
      /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/ // DD/MM/YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const [_, part1, part2, part3] = match;
        
        // Convert to DD-MM-YYYY format
        if (format === formats[1]) {
          // If YYYY-MM-DD format
          return `${part3}-${part2}-${part1}`;
        }
        return `${part1}-${part2}-${part3}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
};