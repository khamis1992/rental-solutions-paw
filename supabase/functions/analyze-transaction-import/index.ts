import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const csvContent = await file.text();
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const requiredFields = [
      'Agreement Number',
      'Customer Name',
      'Amount',
      'License Plate',
      'Vehicle',
      'Payment Date',
      'Payment Method',
      'Payment Number',
      'Payment Description',
      'Type'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !headers.some(h => h.toLowerCase() === field.toLowerCase())
    );

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(', ')}`,
          issues: [`The CSV file is missing the following required fields: ${missingFields.join(', ')}`],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Parse and analyze the data
    const rows = lines.slice(1).filter(line => line.trim() !== '');
    let validRows = 0;
    let invalidRows = 0;
    let totalAmount = 0;
    const issues: string[] = [];

    // Get column indices
    const agreementNumberIndex = headers.findIndex(h => h.toLowerCase() === 'agreement number');
    const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
    const paymentDateIndex = headers.findIndex(h => h.toLowerCase() === 'payment date');
    const typeIndex = headers.findIndex(h => h.toLowerCase() === 'type');

    rows.forEach((row, index) => {
      // Use regex to properly handle quoted values and special characters
      const values = row.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|\d+|[^,]*)/g)
        ?.map(v => v.replace(/^,?"?|"?$/g, '').replace(/""/g, '"').trim()) || [];

      if (values.length < headers.length) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Missing values - row has ${values.length} values but needs ${headers.length}`);
        return;
      }

      const agreementNumber = values[agreementNumberIndex];
      const amount = parseFloat(values[amountIndex]);
      const paymentDate = values[paymentDateIndex];
      const type = values[typeIndex];

      // Validate agreement number exists
      if (!agreementNumber || agreementNumber.trim() === '') {
        invalidRows++;
        issues.push(`Row ${index + 2}: Agreement Number cannot be empty`);
        return;
      }

      if (isNaN(amount)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid amount format`);
      } else {
        validRows++;
        totalAmount += amount;
      }

      // Check date format
      if (!isValidDate(paymentDate)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid date format. Use YYYY-MM-DD`);
      }

      // Validate transaction type
      if (!type || !['INCOME', 'EXPENSE'].includes(type?.toUpperCase())) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid transaction type. Use INCOME or EXPENSE`);
      }
    });

    return new Response(
      JSON.stringify({
        totalRows: rows.length,
        validRows,
        invalidRows,
        totalAmount,
        issues,
        suggestions: invalidRows > 0 ? ['Please review the file for formatting issues before importing.'] : [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}