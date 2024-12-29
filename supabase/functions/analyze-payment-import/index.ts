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

    // Get column indices
    const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
    const dateIndex = headers.findIndex(h => h.toLowerCase() === 'payment_date');
    const methodIndex = headers.findIndex(h => h.toLowerCase() === 'payment_method');
    const statusIndex = headers.findIndex(h => h.toLowerCase() === 'status');
    const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
    const transactionIdIndex = headers.findIndex(h => h.toLowerCase() === 'transaction_id');
    const leaseIdIndex = headers.findIndex(h => h.toLowerCase() === 'lease_id');

    // Parse and analyze the data
    const rows = lines.slice(1).filter(line => line.trim() !== '');
    let validRows = 0;
    let invalidRows = 0;
    let totalAmount = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];
    const parsedRows: any[] = [];

    rows.forEach((row, index) => {
      const values = row.split(',').map(v => v.trim());
      let rowError = false;
      const rowData: any = {};
      
      if (values.length !== headers.length) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid number of columns`);
        rowError = true;
      }

      // Parse amount
      const amount = parseFloat(values[amountIndex]);
      if (isNaN(amount)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid amount format`);
        rowError = true;
      } else {
        totalAmount += amount;
        rowData.amount = amount;
      }

      // Validate date format (DD-MM-YYYY)
      const date = values[dateIndex];
      if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid date format. Use DD-MM-YYYY`);
        rowError = true;
      } else {
        rowData.payment_date = date;
      }

      // Validate payment method
      const method = values[methodIndex];
      if (!['cash', 'credit_card', 'bank_transfer', 'cheque'].includes(method?.toLowerCase())) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid payment method`);
        rowError = true;
      } else {
        rowData.payment_method = method.toLowerCase();
      }

      // Validate status
      const status = values[statusIndex];
      if (!['pending', 'completed', 'failed'].includes(status?.toLowerCase())) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid status`);
        rowError = true;
      } else {
        rowData.status = status.toLowerCase();
      }

      // Add other fields
      rowData.description = values[descriptionIndex];
      rowData.transaction_id = values[transactionIdIndex];
      rowData.lease_id = values[leaseIdIndex];

      if (!rowError) {
        validRows++;
        parsedRows.push(rowData);
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
        rows: parsedRows, // Include the parsed rows in the response
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