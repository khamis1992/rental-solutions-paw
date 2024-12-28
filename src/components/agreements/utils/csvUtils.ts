export const parsePaymentCsv = (content: string) => {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return {
      agreement_number: values[0],
      customer_name: values[1],
      amount: parseFloat(values[2]),
      license_plate: values[3],
      vehicle: values[4],
      payment_date: values[5],
      payment_method: values[6],
      payment_number: values[7],
      description: values[8]
    };
  }).filter(record => record.agreement_number && record.amount);
};

export const validatePaymentCsvHeaders = (headers: string[]) => {
  const requiredHeaders = [
    'Agreement Number',
    'Customer Name',
    'Amount',
    'License Plate',
    'Vehicle',
    'Payment Date',
    'Payment Method',
    'Payment Number',
    'Payment Description'
  ];

  const missingHeaders = requiredHeaders.filter(
    header => !headers.includes(header)
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};