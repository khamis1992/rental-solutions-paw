import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// UUID validation function
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

interface ValidationError {
  row: number;
  originalData: any;
  error: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { rows } = await req.json();
    console.log('Processing transactions:', rows.length);

    const errors: ValidationError[] = [];
    const validRows = [];

    // Validate and process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Validate category_id if present
      if (row.category_id && !isValidUUID(row.category_id)) {
        errors.push({
          row: i + 1,
          originalData: row,
          error: `Invalid UUID format for category_id: ${row.category_id}`
        });
        continue;
      }

      validRows.push(row);
    }

    // Log validation results
    console.log(`Validation complete. Valid rows: ${validRows.length}, Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
    }

    // Save valid rows
    if (validRows.length > 0) {
      const { error: rawDataError } = await supabaseClient
        .from('raw_transaction_imports')
        .insert(validRows.map((row: any) => ({
          raw_data: row,
          is_valid: true
        })));

      if (rawDataError) {
        throw rawDataError;
      }

      // Process and save transactions
      const { error: transactionError } = await supabaseClient
        .from('accounting_transactions')
        .insert(validRows.map((row: any) => ({
          type: 'income',
          amount: row.amount,
          description: row.description,
          transaction_date: row.payment_date,
          status: 'completed',
          reference_type: 'import',
          metadata: {
            agreement_number: row.agreement_number,
            customer_name: row.customer_name,
            license_plate: row.license_plate,
            vehicle: row.vehicle,
            payment_method: row.payment_method,
            payment_number: row.payment_number
          }
        })));

      if (transactionError) {
        throw transactionError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${validRows.length} transactions`,
        errors: errors.length > 0 ? errors : null,
        processedCount: validRows.length,
        errorCount: errors.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing transactions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process transactions'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});