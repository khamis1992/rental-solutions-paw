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
    console.log("Starting delete all transactions process...");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Delete expense transactions
    const { error: expenseError } = await supabaseClient
      .from('expense_transactions')
      .delete();

    if (expenseError) {
      console.error("Error deleting expense transactions:", expenseError);
      throw expenseError;
    }

    // Delete accounting transactions
    const { error: accountingError } = await supabaseClient
      .from('accounting_transactions')
      .delete();

    if (accountingError) {
      console.error("Error deleting accounting transactions:", accountingError);
      throw accountingError;
    }

    console.log("Successfully deleted all transactions");

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error("Error in delete-all-transactions function:", error);
    
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