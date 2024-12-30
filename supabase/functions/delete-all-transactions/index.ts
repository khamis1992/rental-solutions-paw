import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting delete all transactions process in edge function...");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Delete in correct order to handle foreign key constraints
    
    // 1. First delete payment history records
    const { error: paymentHistoryError } = await supabaseClient
      .from('payment_history')
      .delete()
      .gte('created_at', '2000-01-01');

    if (paymentHistoryError) {
      console.error("Error deleting payment history:", paymentHistoryError);
      throw paymentHistoryError;
    }

    // 2. Delete payment reconciliation records
    const { error: reconciliationError } = await supabaseClient
      .from('payment_reconciliation')
      .delete()
      .gte('created_at', '2000-01-01');

    if (reconciliationError) {
      console.error("Error deleting payment reconciliation:", reconciliationError);
      throw reconciliationError;
    }

    // 3. Delete payment matching logs
    const { error: matchingLogsError } = await supabaseClient
      .from('payment_matching_logs')
      .delete()
      .gte('created_at', '2000-01-01');

    if (matchingLogsError) {
      console.error("Error deleting payment matching logs:", matchingLogsError);
      throw matchingLogsError;
    }

    // 4. Delete AI payment analysis
    const { error: aiAnalysisError } = await supabaseClient
      .from('ai_payment_analysis')
      .delete()
      .gte('created_at', '2000-01-01');

    if (aiAnalysisError) {
      console.error("Error deleting AI payment analysis:", aiAnalysisError);
      throw aiAnalysisError;
    }

    // 5. Finally delete the payments themselves
    const { error: paymentsError } = await supabaseClient
      .from('payments')
      .delete()
      .gte('created_at', '2000-01-01');

    if (paymentsError) {
      console.error("Error deleting payments:", paymentsError);
      throw paymentsError;
    }

    // 6. Delete expense transactions
    const { error: expenseError } = await supabaseClient
      .from('expense_transactions')
      .delete()
      .gte('created_at', '2000-01-01');

    if (expenseError) {
      console.error("Error deleting expense transactions:", expenseError);
      throw expenseError;
    }

    // 7. Delete accounting transactions
    const { error: accountingError } = await supabaseClient
      .from('accounting_transactions')
      .delete()
      .gte('created_at', '2000-01-01');

    if (accountingError) {
      console.error("Error deleting accounting transactions:", accountingError);
      throw accountingError;
    }

    console.log("Successfully deleted all transactions in edge function");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "All transactions and related data have been deleted successfully"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Error in delete-all-transactions edge function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while deleting transactions',
        details: error.stack,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});