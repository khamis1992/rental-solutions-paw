import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const validateCSVHeaders = (headers: string[]) => {
  const requiredHeaders = [
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

  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileContent } = await req.json();
    console.log('Processing file:', fileName);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse CSV content
    const lines = fileContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const headers = lines[0].split(',').map((h: string) => h.trim());
    
    // Validate headers
    const headerValidation = validateCSVHeaders(headers);
    if (!headerValidation.isValid) {
      console.error('Missing headers:', headerValidation.missingHeaders);
      return new Response(
        JSON.stringify({ 
          error: `Missing required headers: ${headerValidation.missingHeaders.join(', ')}`,
          issues: [`The CSV file is missing the following required fields: ${headerValidation.missingHeaders.join(', ')}`]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Process each line (skip header)
    const transactions = [];
    const errors = [];
    let validRows = 0;
    let totalAmount = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map((v: string) => v.trim());
        if (values.length !== headers.length) {
          errors.push(`Row ${i}: Invalid number of columns`);
          continue;
        }

        const rowData: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
          rowData[header] = values[index];
        });

        // Validate amount
        const amount = parseFloat(rowData.Amount);
        if (isNaN(amount)) {
          errors.push(`Row ${i}: Invalid amount format`);
          continue;
        }

        // Create transaction object
        const transaction = {
          lease_id: rowData.Lease_ID,
          customer_name: rowData.Customer_Name,
          amount: amount,
          license_plate: rowData.License_Plate,
          vehicle: rowData.Vehicle,
          payment_date: rowData.Payment_Date,
          payment_method: rowData.Payment_Method,
          transaction_id: rowData.Transaction_ID,
          description: rowData.Description,
          type: rowData.Type,
          status: rowData.Status || 'pending'
        };

        transactions.push(transaction);
        validRows++;
        totalAmount += amount;
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push(`Row ${i}: ${error.message}`);
      }
    }

    console.log(`Processing ${transactions.length} transactions`);

    // Create import record
    const { data: importRecord, error: importError } = await supabase
      .from('transaction_imports')
      .insert({
        file_name: fileName,
        status: 'pending',
        records_processed: validRows,
        amount: totalAmount,
        errors: errors.length > 0 ? errors : null
      })
      .select()
      .single();

    if (importError) {
      console.error('Error creating import record:', importError);
      throw importError;
    }

    // Insert transactions in batches of 100
    const batchSize = 100;
    const insertErrors = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('financial_imports')
        .insert(batch);

      if (insertError) {
        console.error('Batch insert error:', insertError);
        insertErrors.push(insertError.message);
      }
    }

    // Update import record status
    const finalStatus = insertErrors.length > 0 ? 'completed_with_errors' : 'completed';
    await supabase
      .from('transaction_imports')
      .update({ 
        status: finalStatus,
        errors: insertErrors.length > 0 ? insertErrors : null
      })
      .eq('id', importRecord.id);

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: transactions.length,
        validRows,
        invalidRows: errors.length,
        totalAmount,
        errors: errors.length > 0 ? errors : undefined,
        suggestions: errors.length > 0 ? [
          'Please review and correct the errors before proceeding',
          'Ensure all amounts are valid numbers',
          'Verify date formats are correct'
        ] : []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error processing import:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});