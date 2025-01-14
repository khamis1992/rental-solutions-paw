export const REQUIRED_FIELDS = [
  'Amount',
  'Payment_Date',
  'Payment_Method',
  'Status',
  'Description',
  'Transaction_ID',
  'Agreement_Number'
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
        
        // Convert to YYYY-MM-DD format for DB
        if (format === formats[0] || format === formats[2]) {
          // DD-MM-YYYY or DD/MM/YYYY
          return `${part3}-${part2}-${part1}`;
        } else {
          // Already in YYYY-MM-DD
          return dateStr;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
};