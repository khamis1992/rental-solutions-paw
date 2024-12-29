import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    console.log('Starting payment import analysis...');
    
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const csvContent = await file.text();
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const requiredFields = [
      'Amount',
      'Payment_Date',
      'Payment_Method',
      'Status',
      'Description',
      'Transaction_ID',
      'Lease_ID'
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
    const suggestions: string[] = [];

    // Get column indices
    const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
    const dateIndex = headers.findIndex(h => h.toLowerCase() === 'payment_date');
    const methodIndex = headers.findIndex(h => h.toLowerCase() === 'payment_method');
    const statusIndex = headers.findIndex(h => h.toLowerCase() === 'status');

    rows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid number of columns`);
        return;
      }

      const amount = parseFloat(values[amountIndex]);
      const date = values[dateIndex];
      const method = values[methodIndex];
      const status = values[statusIndex];

      // Validate amount
      if (isNaN(amount)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid amount format`);
      } else {
        validRows++;
        totalAmount += amount;
      }

      // Validate date format (DD-MM-YYYY)
      if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid date format. Use DD-MM-YYYY`);
      }

      // Validate payment method
      if (!['cash', 'credit_card', 'bank_transfer', 'cheque'].includes(method?.toLowerCase())) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid payment method`);
      }

      // Validate status
      if (!['pending', 'completed', 'failed'].includes(status?.toLowerCase())) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid status`);
      }
    });

    // Add suggestions based on analysis
    if (invalidRows > 0) {
      suggestions.push('Please review and correct the invalid entries before importing');
    }
    if (validRows === 0) {
      suggestions.push('No valid rows found in the file');
    }

    console.log('Analysis completed successfully');

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
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});