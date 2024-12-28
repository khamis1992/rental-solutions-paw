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

    const { transactions } = await req.json()
    console.log('Processing transactions:', transactions.length)

    // Validate transactions
    const validatedTransactions = transactions.filter(transaction => {
      const isValid = 
        transaction.amount > 0 &&
        !isNaN(new Date(transaction.transaction_date).getTime()) &&
        transaction.metadata?.agreement_number;
      
      if (!isValid) {
        console.warn('Invalid transaction:', transaction);
      }
      
      return isValid;
    });

    // Save validated transactions
    const { error: transactionError } = await supabaseClient
      .from('accounting_transactions')
      .insert(validatedTransactions);

    if (transactionError) {
      console.error('Error saving transactions:', transactionError);
      throw transactionError;
    }

    // Update financial metrics in real-time
    const { error: metricsError } = await supabaseClient
      .from('financial_insights')
      .insert({
        category: 'income',
        insight: 'New transactions imported',
        data_points: {
          transaction_count: validatedTransactions.length,
          total_amount: validatedTransactions.reduce((sum, t) => sum + t.amount, 0)
        }
      });

    if (metricsError) {
      console.warn('Error updating metrics:', metricsError);
      // Don't throw here as it's not critical
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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})