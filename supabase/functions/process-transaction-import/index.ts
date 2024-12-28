import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { rows } = await req.json()
    console.log('Processing transactions:', rows.length)

    // Validate transactions
    const validatedTransactions = rows.filter(transaction => {
      const isValid = 
        transaction.amount > 0 &&
        !isNaN(new Date(transaction.payment_date).getTime()) &&
        transaction.agreement_number;
      
      if (!isValid) {
        console.warn('Invalid transaction:', transaction);
      }
      
      return isValid;
    });

    // Save validated transactions
    const { error: transactionError } = await supabaseClient
      .from('accounting_transactions')
      .insert(validatedTransactions.map(transaction => ({
        type: 'INCOME',
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: new Date(transaction.payment_date).toISOString(),
        reference_type: 'import',
        status: 'completed',
        meta_data: {
          agreement_number: transaction.agreement_number,
          payment_method: transaction.payment_method,
          payment_number: transaction.payment_number
        }
      })));

    if (transactionError) {
      console.error('Error saving transactions:', transactionError);
      throw transactionError;
    }

    // Save raw import data for reference
    const { error: rawImportError } = await supabaseClient
      .from('raw_transaction_imports')
      .insert(validatedTransactions.map(transaction => ({
        raw_data: transaction,
        is_valid: true
      })));

    if (rawImportError) {
      console.error('Error saving raw imports:', rawImportError);
      // Don't throw here as the main transactions were saved successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: validatedTransactions.length,
        total: rows.length,
        skipped: rows.length - validatedTransactions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing transactions:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})