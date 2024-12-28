import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse and validate request body
    const requestData = await req.json()
    console.log('Received request data:', requestData)

    // Validate transactions array exists
    if (!requestData.transactions || !Array.isArray(requestData.transactions)) {
      console.error('Invalid request: transactions array is missing or not an array')
      throw new Error('Invalid request: transactions array is required')
    }

    const transactions = requestData.transactions
    console.log('Processing transactions:', transactions.length)

    // Validate each transaction
    const validatedTransactions = transactions.filter(transaction => {
      // Validate required fields
      const isValid = 
        transaction &&
        typeof transaction.amount === 'number' &&
        transaction.amount > 0 &&
        transaction.transaction_date &&
        !isNaN(new Date(transaction.transaction_date).getTime()) &&
        transaction.metadata?.agreement_number;
      
      if (!isValid) {
        console.warn('Invalid transaction:', transaction);
      }
      
      return isValid;
    });

    console.log('Validated transactions count:', validatedTransactions.length)

    if (validatedTransactions.length === 0) {
      throw new Error('No valid transactions found in the request')
    }

    // Save validated transactions
    const { error: transactionError } = await supabaseClient
      .from('accounting_transactions')
      .insert(validatedTransactions);

    if (transactionError) {
      console.error('Error saving transactions:', transactionError)
      throw transactionError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: validatedTransactions.length,
        total: transactions.length,
        skipped: transactions.length - validatedTransactions.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing transactions:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})