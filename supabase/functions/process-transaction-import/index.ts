import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting transaction import process...');
    
    // Parse and validate request body
    const requestData = await req.json();
    console.log('Request payload:', requestData);

    if (!requestData.fileName || !requestData.fileContent) {
      console.error('Missing required fields in request');
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: fileName and fileContent are required'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse CSV content
    const lines = requestData.fileContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const headers = lines[0].split(',').map((h: string) => h.trim());
    
    // Process rows (skip header)
    const transactions = [];
    const errors = [];
    let validRows = 0;
    let totalAmount = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: Record<string, string> = {};
        
        headers.forEach((header, index) => {
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
          amount: amount,
          description: rowData.Description,
          transaction_date: new Date(rowData.Payment_Date).toISOString(),
          type: rowData.Type?.toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE',
          status: 'completed',
          reference_type: 'import',
          meta_data: {
            import_source: 'csv',
            original_data: rowData
          }
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
        file_name: requestData.fileName,
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
        .from('accounting_transactions')
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