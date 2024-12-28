import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Required fields for transaction imports
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

    // Analyze the data
    const rows = lines.slice(1).filter(line => line.trim() !== '');
    let validRows = 0;
    let invalidRows = 0;
    let totalAmount = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Get column indices
    const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
    const paymentDateIndex = headers.findIndex(h => h.toLowerCase() === 'payment date');
    const typeIndex = headers.findIndex(h => h.toLowerCase() === 'type');

    rows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      
      // Check if we have all required values
      if (values.length < headers.length) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Missing values - row has ${values.length} values but needs ${headers.length}`);
        return; // Skip further validation for this row
      }

      const amount = parseFloat(values[amountIndex]);
      const paymentDate = values[paymentDateIndex];
      const type = values[typeIndex];
      
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
      if (!type || !['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid transaction type. Use INCOME or EXPENSE`);
      }
    });

    if (validRows === 0) {
      suggestions.push('No valid transactions found. Please check the file format.');
    }

    if (invalidRows > 0) {
      suggestions.push('Consider reviewing the file for formatting issues before importing.');
    }

    return new Response(
      JSON.stringify({
        totalRows: rows.length,
        validRows,
        invalidRows,
        totalAmount,
        issues,
        suggestions,
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