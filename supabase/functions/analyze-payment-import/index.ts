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
      'Lease_ID',
      'Customer_Name',
      'Amount',
      'License_Plate',
      'Vehicle',
      'Payment_Date',
      'Payment_Method',
      'Transaction_ID',
      'Description',
      'Type',
      'Status'
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

    // Get column indices for all required fields
    const columnIndices = {
      lease_id: headers.findIndex(h => h.toLowerCase() === 'lease_id'),
      customer_name: headers.findIndex(h => h.toLowerCase() === 'customer_name'),
      amount: headers.findIndex(h => h.toLowerCase() === 'amount'),
      license_plate: headers.findIndex(h => h.toLowerCase() === 'license_plate'),
      vehicle: headers.findIndex(h => h.toLowerCase() === 'vehicle'),
      payment_date: headers.findIndex(h => h.toLowerCase() === 'payment_date'),
      payment_method: headers.findIndex(h => h.toLowerCase() === 'payment_method'),
      transaction_id: headers.findIndex(h => h.toLowerCase() === 'transaction_id'),
      description: headers.findIndex(h => h.toLowerCase() === 'description'),
      type: headers.findIndex(h => h.toLowerCase() === 'type'),
      status: headers.findIndex(h => h.toLowerCase() === 'status')
    };

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
      const amount = parseFloat(values[columnIndices.amount]);
      if (isNaN(amount)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid amount format`);
        rowError = true;
      } else {
        totalAmount += amount;
        rowData.amount = amount;
      }

      // Add all fields to rowData
      rowData.lease_id = values[columnIndices.lease_id];
      rowData.customer_name = values[columnIndices.customer_name];
      rowData.license_plate = values[columnIndices.license_plate];
      rowData.vehicle = values[columnIndices.vehicle];
      rowData.payment_date = values[columnIndices.payment_date];
      rowData.payment_method = values[columnIndices.payment_method]?.toLowerCase();
      rowData.transaction_id = values[columnIndices.transaction_id];
      rowData.description = values[columnIndices.description];
      rowData.type = values[columnIndices.type]?.toUpperCase();
      rowData.status = values[columnIndices.status]?.toLowerCase();

      // Validate payment method
      if (!['cash', 'credit_card', 'bank_transfer', 'cheque'].includes(rowData.payment_method)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid payment method`);
        rowError = true;
      }

      // Validate status
      if (!['pending', 'completed', 'failed'].includes(rowData.status)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid status`);
        rowError = true;
      }

      // Validate type
      if (!['INCOME', 'EXPENSE'].includes(rowData.type)) {
        invalidRows++;
        issues.push(`Row ${index + 2}: Invalid type (must be INCOME or EXPENSE)`);
        rowError = true;
      }

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
    console.log(`Found ${validRows} valid rows and ${invalidRows} invalid rows`);

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