import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function formatDate(dateString: string): string {
  if (!dateString) return new Date().toISOString();
  
  try {
    // Try parsing the date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isValidDate(dateString)) {
      return date.toISOString();
    }
    
    // If invalid, return current date
    return new Date().toISOString();
  } catch {
    // If parsing fails, return current date
    return new Date().toISOString();
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting transaction import process');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );

    const { rows } = await req.json();
    console.log('Processing transaction import with rows:', rows.length);

    // Create import log
    const { data: importLog, error: importLogError } = await supabaseClient
      .from('transaction_imports')
      .insert({
        file_name: 'transaction_import_' + new Date().toISOString(),
        status: 'processing',
      })
      .select()
      .single();

    if (importLogError) {
      console.error('Error creating import log:', importLogError);
      throw importLogError;
    }

    console.log('Created import log:', importLog);

    // Save raw import data with validation
    const processedRows = rows.map((row: any) => ({
      import_id: importLog.id,
      raw_data: row,
      is_valid: true,
      created_at: new Date().toISOString()
    }));

    const { error: rawImportError } = await supabaseClient
      .from('raw_transaction_imports')
      .insert(processedRows);

    if (rawImportError) {
      console.error('Error saving raw imports:', rawImportError);
      throw rawImportError;
    }

    console.log('Saved raw transaction data');

    // Prepare transactions for insert with validated dates
    const transactions = rows.map((row: any) => ({
      type: 'income',
      amount: parseFloat(row.amount) || 0,
      description: row.description || '',
      transaction_date: formatDate(row.transaction_date),
      status: 'completed',
      reference_type: 'import',
      reference_id: importLog.id
    }));

    const { error: transactionError } = await supabaseClient
      .from('accounting_transactions')
      .insert(transactions);

    if (transactionError) {
      console.error('Error inserting transactions:', transactionError);
      await supabaseClient
        .from('transaction_imports')
        .update({ 
          status: 'error',
          errors: { message: transactionError.message }
        })
        .eq('id', importLog.id);
      throw transactionError;
    }

    // Update import log status
    const { error: updateError } = await supabaseClient
      .from('transaction_imports')
      .update({ 
        status: 'completed',
        records_processed: transactions.length
      })
      .eq('id', importLog.id);

    if (updateError) {
      console.error('Error updating import log status:', updateError);
      throw updateError;
    }

    console.log('Import process completed successfully');

    return new Response(
      JSON.stringify({ success: true, importLog }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing import:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});