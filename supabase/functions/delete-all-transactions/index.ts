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

    // First, count the expense transactions
    const { count: expenseCount, error: countExpenseError } = await supabaseClient
      .from('expense_transactions')
      .select('*', { count: 'exact', head: true });

    if (countExpenseError) {
      console.error("Error counting expense transactions:", countExpenseError);
      throw countExpenseError;
    }

    // Then delete expense transactions using a simple delete
    const { error: expenseError } = await supabaseClient
      .from('expense_transactions')
      .delete();

    if (expenseError) {
      console.error("Error deleting expense transactions:", expenseError);
      throw expenseError;
    }

    console.log(`Successfully deleted ${expenseCount} expense transactions`);

    // Count accounting transactions
    const { count: accountingCount, error: countAccountingError } = await supabaseClient
      .from('accounting_transactions')
      .select('*', { count: 'exact', head: true });

    if (countAccountingError) {
      console.error("Error counting accounting transactions:", countAccountingError);
      throw countAccountingError;
    }

    // Delete accounting transactions using a simple delete
    const { error: accountingError } = await supabaseClient
      .from('accounting_transactions')
      .delete();

    if (accountingError) {
      console.error("Error deleting accounting transactions:", accountingError);
      throw accountingError;
    }

    console.log(`Successfully deleted ${accountingCount} accounting transactions`);
    console.log("Successfully deleted all transactions in edge function");

    return new Response(
      JSON.stringify({ 
        success: true,
        deletedCounts: {
          expenses: expenseCount || 0,
          accounting: accountingCount || 0
        }
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